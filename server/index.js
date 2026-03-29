import cors from 'cors';
import express from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = 8787;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, 'data');
const tasksFile = path.join(dataDir, 'tasks.json');
const automationsFile = path.join(dataDir, 'automations.json');

app.use(cors());
app.use(express.json());

const providers = [
  {
    id: 'anthropic-sdk',
    name: 'Anthropic Agent SDK',
    transport: 'local-sdk',
    description: 'Claude-style agent runtime exposed through a local SDK bridge or desktop helper.',
    models: [
      { id: 'claude-sonnet-4', label: 'Claude Sonnet 4' },
      { id: 'claude-3-7-sonnet', label: 'Claude 3.7 Sonnet' },
    ],
  },
  {
    id: 'codex',
    name: 'ChatGPT Codex',
    transport: 'responses',
    description: 'OpenAI Responses API backend for Codex-style task execution and tool use.',
    models: [
      { id: 'gpt-5-codex', label: 'GPT-5 Codex' },
      { id: 'gpt-5-mini', label: 'GPT-5 Mini' },
    ],
  },
  {
    id: 'ollama',
    name: 'Ollama API',
    transport: 'local-http',
    description: 'Use local open-weight models over the Ollama API.',
    models: [
      { id: 'qwen2.5-coder:14b', label: 'Qwen 2.5 Coder 14B' },
      { id: 'llama3.3:70b', label: 'Llama 3.3 70B' },
    ],
  },
];

const tasks = new Map();
const taskSecrets = new Map();
const oauthStates = new Map();
let automations = [];

bootstrapData();

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/providers', (_req, res) => {
  res.json({ providers });
});

app.get('/api/tasks', (_req, res) => {
  const items = Array.from(tasks.values()).sort((left, right) => {
    return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
  });

  res.json({ tasks: items });
});

app.get('/api/automations', (_req, res) => {
  res.json({ automations });
});

app.post('/api/automations', (req, res) => {
  const {
    title = '',
    prompt = '',
    target = 'Worktree',
    project = 'OpenWork',
    schedule = 'Daily at 9:00 AM',
    status = 'active',
  } = req.body ?? {};

  const automation = {
    id: `automation_${Math.random().toString(36).slice(2, 10)}`,
    title,
    prompt,
    target,
    project,
    schedule,
    status,
    createdAt: new Date().toISOString(),
  };

  automations = [automation, ...automations];
  persistAutomations();

  res.status(201).json({ automation });
});

app.get('/api/auth/openai/start', (_req, res) => {
  const clientId = process.env.OPENAI_OAUTH_CLIENT_ID || '';
  const redirectUri = process.env.OPENAI_OAUTH_REDIRECT_URI || `http://127.0.0.1:${port}/api/auth/openai/callback`;
  const scope = process.env.OPENAI_OAUTH_SCOPE || '';

  if (!clientId) {
    res.status(400).json({ error: 'Missing OPENAI_OAUTH_CLIENT_ID. Configure an OpenAI OAuth client for OpenWork first.' });
    return;
  }

  const state = crypto.randomUUID();
  const codeVerifier = base64UrlEncode(crypto.randomBytes(32));
  const codeChallenge = base64UrlEncode(crypto.createHash('sha256').update(codeVerifier).digest());

  oauthStates.set(state, {
    codeVerifier,
    redirectUri,
    createdAt: Date.now(),
  });

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    state,
  });

  if (scope) {
    params.set('scope', scope);
  }

  res.json({
    url: `https://auth.openai.com/oauth/authorize?${params.toString()}`,
  });
});

app.get('/api/auth/openai/callback', async (req, res) => {
  const { code = '', state = '', error = '' } = req.query;

  if (error) {
    res.send(renderOAuthCallbackPage({ ok: false, error: String(error) }));
    return;
  }

  const pending = oauthStates.get(String(state));
  if (!pending) {
    res.send(renderOAuthCallbackPage({ ok: false, error: 'Missing or expired OAuth state.' }));
    return;
  }

  oauthStates.delete(String(state));

  try {
    const clientId = process.env.OPENAI_OAUTH_CLIENT_ID || '';
    const tokenEndpoint = process.env.OPENAI_OAUTH_TOKEN_ENDPOINT || 'https://auth.openai.com/oauth/token';
    const tokenResponse = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: String(code),
        client_id: clientId,
        redirect_uri: pending.redirectUri,
        code_verifier: pending.codeVerifier,
      }),
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok) {
      res.send(renderOAuthCallbackPage({ ok: false, error: tokenData.error_description || tokenData.error || 'OAuth exchange failed.' }));
      return;
    }

    res.send(renderOAuthCallbackPage({
      ok: true,
      payload: {
        accessToken: tokenData.access_token || '',
        refreshToken: tokenData.refresh_token || '',
        expiresIn: tokenData.expires_in || null,
        scope: tokenData.scope || '',
        tokenType: tokenData.token_type || 'Bearer',
      },
    }));
  } catch (exchangeError) {
    res.send(renderOAuthCallbackPage({
      ok: false,
      error: exchangeError instanceof Error ? exchangeError.message : 'OAuth exchange failed.',
    }));
  }
});

app.post('/api/chat', async (req, res) => {
  const {
    messages = [],
    provider = 'codex',
    model = 'gpt-5-codex',
    endpoint = '',
    apiKey = '',
    oauthAccessToken = '',
  } = req.body ?? {};

  const conversation = Array.isArray(messages) ? messages : [];
  const lastUserMessage = [...conversation].reverse().find((message) => message.role === 'user')?.content || '';

  try {
    let result;

    if (provider === 'codex') {
      result = await runCodexChat({ messages: conversation, model, endpoint, credential: apiKey || oauthAccessToken });
    } else if (provider === 'ollama') {
      result = await runOllamaChat({ messages: conversation, model, endpoint });
    } else {
      result = {
        reply: `OpenWork is not connected to ${provider} yet. I received: "${lastUserMessage}"`,
        provider,
      };
    }

    res.json({
      message: {
        role: 'assistant',
        content: result.reply,
      },
      provider: result.provider || provider,
      model: result.model || model,
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Chat request failed.',
    });
  }
});

app.post('/api/tasks', (req, res) => {
  const { prompt = '', provider = 'anthropic-sdk', model = 'claude-sonnet-4', mode = 'computer-use', endpoint = '', apiKey = '', oauthAccessToken = '' } = req.body ?? {};

  const task = createTask({ prompt, provider, model, mode, endpoint });
  tasks.set(task.id, task);
  persistTasks();
  taskSecrets.set(task.id, { apiKey, endpoint, oauthAccessToken });
  advanceTask(task.id);

  res.status(201).json({ task });
});

app.get('/api/tasks/:taskId', (req, res) => {
  const task = tasks.get(req.params.taskId);
  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }

  res.json({ task });
});

app.listen(port, () => {
  console.log(`OpenWork server listening on http://localhost:${port}`);
});

function createTask({ prompt, provider, model, mode, endpoint }) {
  const id = `task_${Math.random().toString(36).slice(2, 10)}`;
  const now = new Date();

  return {
    id,
    prompt,
    provider,
    model,
    mode,
    status: 'running',
    createdAt: now.toISOString(),
    summary: 'The runtime is preparing a stepwise execution plan and selecting the required tools.',
    document: `# ${mode === 'computer-use' ? 'Computer-use' : 'Agent'} run\n\nPrompt: ${prompt}\n\nPlanning started at ${now.toLocaleTimeString()}.`,
    artifacts: [],
    messages: [
      { role: 'user', content: prompt },
      { role: 'assistant', content: `I am starting a ${mode} run using ${provider} / ${model}${endpoint ? ` via ${endpoint}` : ''}. I will plan the work, choose tools, and record the outputs here.` },
    ],
    steps: [
      {
        id: `${id}_step_1`,
        title: 'Interpret prompt',
        tool: 'planner',
        detail: 'Break the task into manageable stages and select the right tool surfaces.',
        status: 'completed',
      },
      {
        id: `${id}_step_2`,
        title: 'Prepare tool envelope',
        tool: 'runtime',
        detail: 'Load filesystem, browser, and terminal permissions for the run.',
        status: 'running',
      },
    ],
    logs: [
      { time: now.toLocaleTimeString(), text: `planner> received task "${prompt}"`, type: 'info' },
      { time: now.toLocaleTimeString(), text: `runtime> provider=${provider} model=${model} mode=${mode}${endpoint ? ` endpoint=${endpoint}` : ''}`, type: 'info' },
    ],
    suggestedFollowUps: [],
  };
}

function advanceTask(taskId) {
  const secrets = taskSecrets.get(taskId) ?? { apiKey: '', endpoint: '', oauthAccessToken: '' };
  const scriptedPhases = [
    (task) => {
      task.summary = 'The runtime has prepared tools and is starting active execution.';
      task.steps[1] = { ...task.steps[1], status: 'completed', detail: 'Permissions staged for shell, files, and browser actions.' };
      task.steps.push({
        id: `${task.id}_step_3`,
        title: task.mode === 'computer-use' ? 'Open browser session' : 'Inspect workspace',
        tool: task.mode === 'computer-use' ? 'browser' : 'filesystem',
        detail: task.mode === 'computer-use'
          ? 'Created a browser tab and began collecting UI context for the task.'
          : 'Mapped workspace files and prepared edit targets for the requested changes.',
        status: 'running',
        url: 'https://workspace.local/preview',
      });
      task.logs.push({ time: new Date().toLocaleTimeString(), text: `${task.mode === 'computer-use' ? 'browser' : 'fs'}> context capture started`, type: 'info' });
      task.document += '\n\n## Execution\n- Tool envelope prepared\n- Active context capture underway';
    },
    async (task) => {
      const executingStep = task.steps.find((step) => step.status === 'running');
      if (executingStep) {
        executingStep.status = 'completed';
      }
      task.steps.push({
        id: `${task.id}_step_4`,
        title: 'Produce artifact and summary',
        tool: 'writer',
        detail: 'Synthesizing outputs, next actions, and a clean summary for the operator.',
        status: 'completed',
      });
      if (task.provider === 'codex') {
        const codexResult = await runCodexTask(task, secrets);
        if (!codexResult.ok) {
          task.summary = codexResult.summary;
          task.document = codexResult.document;
          task.messages.push({ role: 'assistant', content: codexResult.message });
          task.logs.push({ time: new Date().toLocaleTimeString(), text: codexResult.log, type: 'error' });
          task.status = 'failed';
          taskSecrets.delete(task.id);
          persistTasks();
          return;
        }

        task.summary = codexResult.summary;
        task.document = codexResult.document;
        task.messages.push({ role: 'assistant', content: codexResult.message });
        task.logs.push({ time: new Date().toLocaleTimeString(), text: codexResult.log, type: 'info' });
      } else if (task.provider === 'ollama') {
        const ollamaResult = await runOllamaTask(task, secrets);
        if (!ollamaResult.ok) {
          task.summary = ollamaResult.summary;
          task.document = ollamaResult.document;
          task.messages.push({ role: 'assistant', content: ollamaResult.message });
          task.logs.push({ time: new Date().toLocaleTimeString(), text: ollamaResult.log, type: 'error' });
          task.status = 'failed';
          taskSecrets.delete(task.id);
          persistTasks();
          return;
        }

        task.summary = ollamaResult.summary;
        task.document = ollamaResult.document;
        task.messages.push({ role: 'assistant', content: ollamaResult.message });
        task.logs.push({ time: new Date().toLocaleTimeString(), text: ollamaResult.log, type: 'info' });
      } else {
        task.summary = `Completed a ${task.mode} run with ${task.provider}. The system planned the task, prepared tools, captured context, and produced artifacts.`;
        task.document = buildDocument(task);
        task.messages.push({
          role: 'assistant',
          content: 'The run completed. I left a concise summary, a document artifact, and a replayable trace of the tools used.',
        });
        task.logs.push({ time: new Date().toLocaleTimeString(), text: 'writer> generated summary artifact and structured trace', type: 'info' });
      }

      task.artifacts = [
        {
          name: `${slugify(task.prompt).slice(0, 30) || 'run'}-summary.md`,
          type: 'markdown',
          description: 'A concise artifact with the plan, steps taken, and recommended follow-up work.',
        },
        {
          name: 'runtime-trace.json',
          type: 'json',
          description: 'Normalized provider and tool events for replay or UI inspection.',
        },
      ];
      task.suggestedFollowUps = [
        'Wire real provider credentials into the adapter layer.',
        'Replace the mock browser session with Playwright or a remote desktop bridge.',
        'Persist runs and artifacts in SQLite for multi-project history.',
      ];
      task.status = 'completed';
      taskSecrets.delete(task.id);
      persistTasks();
    },
  ];

  scriptedPhases.forEach((phase, index) => {
    setTimeout(() => {
      const current = tasks.get(taskId);
      if (!current || current.status !== 'running') return;
      Promise.resolve(phase(current)).finally(() => {
        tasks.set(taskId, current);
        persistTasks();
      });
    }, 1700 * (index + 1));
  });
}

function buildDocument(task) {
  return [
    '# Run Summary',
    '',
    `Prompt: ${task.prompt}`,
    `Provider: ${task.provider}`,
    `Model: ${task.model}`,
    `Mode: ${task.mode}`,
    '',
    '## What happened',
    '- Parsed the request into a staged execution plan',
    '- Prepared the tool runtime for shell, file, and browser actions',
    '- Captured context and generated operator-facing artifacts',
    '',
    '## Recommended next steps',
    '- Connect real backend credentials and stream actual model responses',
    '- Attach a real browser/computer-use transport',
    '- Persist tasks, runs, and traces for replay',
  ].join('\n');
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function runCodexTask(task, secrets) {
  const bearerToken = secrets.apiKey || secrets.oauthAccessToken;

  if (!bearerToken) {
    return {
      ok: false,
      summary: 'Codex requires an OpenAI credential.',
      document: '# Codex Connection Error\n\nAdd an OpenAI API key or connect OpenAI OAuth in Settings to use ChatGPT Codex.',
      message: 'The Codex provider is selected, but no OpenAI credential was provided.',
      log: 'codex> missing OpenAI credential',
    };
  }

  try {
    const endpoint = normalizeOpenAIEndpoint(secrets.endpoint);
    const response = await fetch(`${endpoint}/responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bearerToken}`,
      },
      body: JSON.stringify({
        model: task.model,
        input: `You are Codex running inside OpenWork. Complete the user's request and return a concise markdown result.\n\nUser request: ${task.prompt}`,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return {
        ok: false,
        summary: `Codex request failed with status ${response.status}.`,
        document: `# Codex Request Failed\n\nStatus: ${response.status}\n\n${text}`,
        message: `The Codex request failed with status ${response.status}.`,
        log: `codex> request failed status=${response.status}`,
      };
    }

    const data = await response.json();
    const outputText = extractResponseText(data);

    return {
      ok: true,
      summary: `Completed a ${task.mode} run with ChatGPT Codex using ${task.model}.`,
      document: outputText || '# Codex Result\n\nThe request completed, but no text output was returned.',
      message: outputText ? 'Codex completed the run and returned a response.' : 'Codex completed the run, but returned no text output.',
      log: `codex> completed response using model=${task.model}`,
    };
  } catch (error) {
    return {
      ok: false,
      summary: 'Codex request failed before completion.',
      document: `# Codex Connection Error\n\n${error instanceof Error ? error.message : 'Unknown error.'}`,
      message: `Codex failed to connect: ${error instanceof Error ? error.message : 'Unknown error.'}`,
      log: `codex> connection error ${error instanceof Error ? error.message : 'unknown'}`,
    };
  }
}

async function runOllamaTask(task, secrets) {
  try {
    const response = await fetch(normalizeOllamaEndpoint(secrets.endpoint), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: task.model,
        stream: false,
        messages: [
          {
            role: 'system',
            content: 'You are an OpenWork local coding and operations agent. Return concise markdown with a short summary and a working note.',
          },
          {
            role: 'user',
            content: task.prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return {
        ok: false,
        summary: `Ollama request failed with status ${response.status}.`,
        document: `# Ollama Request Failed\n\nStatus: ${response.status}\n\n${text}`,
        message: `The Ollama request failed with status ${response.status}.`,
        log: `ollama> request failed status=${response.status}`,
      };
    }

    const data = await response.json();
    const outputText = data?.message?.content || data?.response || '';

    return {
      ok: true,
      summary: `Completed a ${task.mode} run with Ollama using ${task.model}.`,
      document: outputText || '# Ollama Result\n\nThe local model completed, but returned no text output.',
      message: outputText ? 'Ollama completed the run and returned a response.' : 'Ollama completed the run, but returned no text output.',
      log: `ollama> completed response using model=${task.model}`,
    };
  } catch (error) {
    return {
      ok: false,
      summary: 'Ollama request failed before completion.',
      document: `# Ollama Connection Error\n\n${error instanceof Error ? error.message : 'Unknown error.'}`,
      message: `Ollama failed to connect: ${error instanceof Error ? error.message : 'Unknown error.'}`,
      log: `ollama> connection error ${error instanceof Error ? error.message : 'unknown'}`,
    };
  }
}

async function runCodexChat({ messages, model, endpoint, credential }) {
  if (!credential) {
    throw new Error('Add an OpenAI API key or OAuth connection in Settings to chat with Codex.');
  }

  const response = await fetch(`${normalizeOpenAIEndpoint(endpoint)}/responses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${credential}`,
    },
    body: JSON.stringify({
      model,
      input: buildResponseInput(messages),
    }),
  });

  if (!response.ok) {
    throw new Error(`Codex chat failed with status ${response.status}.`);
  }

  const data = await response.json();
  return {
    reply: extractResponseText(data) || 'Codex completed, but returned no text output.',
    provider: 'codex',
    model,
  };
}

async function runOllamaChat({ messages, model, endpoint }) {
  const response = await fetch(normalizeOllamaEndpoint(endpoint), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      stream: false,
      messages: messages.map((message) => ({
        role: message.role === 'assistant' ? 'assistant' : 'user',
        content: message.content,
      })),
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama chat failed with status ${response.status}.`);
  }

  const data = await response.json();
  return {
    reply: data?.message?.content || data?.response || 'Ollama completed, but returned no text output.',
    provider: 'ollama',
    model,
  };
}

function normalizeOpenAIEndpoint(endpoint) {
  const trimmed = (endpoint || 'https://api.openai.com/v1').replace(/\/+$/, '');
  return trimmed.endsWith('/v1') ? trimmed : `${trimmed}/v1`;
}

function normalizeOllamaEndpoint(endpoint) {
  const trimmed = (endpoint || 'http://localhost:11434').replace(/\/+$/, '');
  return trimmed.endsWith('/api/chat') ? trimmed : `${trimmed}/api/chat`;
}

function extractResponseText(data) {
  if (typeof data?.output_text === 'string' && data.output_text.length) {
    return data.output_text;
  }

  const output = Array.isArray(data?.output) ? data.output : [];
  const textParts = [];

  output.forEach((item) => {
    const content = Array.isArray(item?.content) ? item.content : [];
    content.forEach((part) => {
      if (typeof part?.text === 'string') {
        textParts.push(part.text);
      }
    });
  });

  return textParts.join('\n\n').trim();
}

function buildResponseInput(messages) {
  return messages.map((message) => ({
    role: message.role === 'assistant' ? 'assistant' : 'user',
    content: [{ type: 'input_text', text: message.content }],
  }));
}

function base64UrlEncode(value) {
  return Buffer.from(value)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function renderOAuthCallbackPage({ ok, payload = null, error = '' }) {
  const serialized = JSON.stringify({ source: 'openwork-openai-oauth', ok, payload, error });
  return `<!doctype html>
<html>
  <body style="background:#111;color:#fff;font-family:Inter,system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;">
    <div style="text-align:center;max-width:480px;padding:24px;">
      <h1 style="font-size:20px;margin-bottom:12px;">${ok ? 'OpenAI connected' : 'OpenAI connection failed'}</h1>
      <p style="line-height:1.6;color:#b3b3b3;">${ok ? 'You can close this window and return to OpenWork.' : error}</p>
    </div>
    <script>
      (function () {
        const message = ${serialized};
        if (window.opener) {
          window.opener.postMessage(message, window.location.origin);
        }
        setTimeout(() => window.close(), 200);
      })();
    </script>
  </body>
</html>`;
}

function bootstrapData() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const taskItems = readJson(tasksFile, []);
  taskItems.forEach((task) => {
    tasks.set(task.id, task);
  });

  automations = readJson(automationsFile, []);
}

function persistTasks() {
  fs.writeFileSync(tasksFile, JSON.stringify(Array.from(tasks.values()), null, 2));
}

function persistAutomations() {
  fs.writeFileSync(automationsFile, JSON.stringify(automations, null, 2));
}

function readJson(filename, fallback) {
  if (!fs.existsSync(filename)) {
    return fallback;
  }

  try {
    return JSON.parse(fs.readFileSync(filename, 'utf8'));
  } catch {
    return fallback;
  }
}
