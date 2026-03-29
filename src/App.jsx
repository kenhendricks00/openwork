import React, { useEffect, useRef, useState } from 'react';
import {
  Search,
  MessageSquare,
  Monitor,
  Plus,
  ListTodo,
  FileCode,
  Share2,
  Zap,
  LayoutGrid,
  User,
  Mic,
  Volume2,
  ChevronRight,
  Terminal,
  FileText,
  Cpu,
  Sparkles,
  Loader2,
  Settings,
  Paperclip,
  Github,
  Slack,
  Mail,
  HardDrive,
  FolderOpen,
  MousePointer2,
  Briefcase,
  Eye,
  ArrowRight,
  X,
  Globe,
  GraduationCap,
  Network,
  Check,
} from 'lucide-react';

const promptGroups = {
  learn: [
    'Compare tools or frameworks and recommend one',
    'Help me deeply understand a confusing topic',
    'Turn my notes into a polished write-up',
    'Quiz me until I can recall it confidently',
    'Find the best resources and give me a running digest',
  ],
  business: [
    'Draft a lean business model for a new SaaS idea',
    'Create a competitive analysis for my specific niche',
    'Generate a marketing plan for a Q4 product launch',
    'Design a landing page structure optimized for conversions',
    'Review my pitch deck and suggest key improvements',
  ],
  monitor: [
    'Track the latest breakthroughs in agentic AI development',
    'Monitor stock market shifts for major tech companies',
    'Alert me on regulatory changes in the fintech sector',
    'Summarize the daily top news for the renewable energy industry',
    'Track sentiment changes for my brand across social platforms',
  ],
};

const useCases = [
  { title: 'Federal Workforce Reduction Impact Map', type: 'App', color: 'from-blue-600/30 to-indigo-600/10' },
  { title: 'Big Mac Index Explorer', type: 'App', color: 'from-emerald-600/30 to-teal-600/10' },
  { title: 'US Presidential Elections, 1788-2024', type: 'App', color: 'from-zinc-700/50 to-zinc-900/10' },
  { title: 'State of US Politics - Polymarket Intelligence', type: 'App', color: 'from-amber-600/30 to-orange-600/10' },
  { title: 'Diff Eq Lecture1', type: 'Presentation', color: 'from-indigo-600/30 to-purple-600/10' },
  { title: 'Tesla Stock History Timeline', type: 'App', color: 'from-red-600/30 to-pink-600/10' },
];

const skills = [
  {
    id: 'research-brief',
    name: 'Research Brief',
    category: 'Analysis',
    status: 'Ready',
    description: 'Turn scattered sources into a concise brief with findings, risks, and next actions.',
    accent: 'from-blue-500/20 to-cyan-500/10',
  },
  {
    id: 'repo-cowork',
    name: 'Repo Cowork',
    category: 'Engineering',
    status: 'Ready',
    description: 'Inspect a codebase, summarize architecture, and prepare implementation-ready plans.',
    accent: 'from-emerald-500/20 to-teal-500/10',
  },
  {
    id: 'browser-operator',
    name: 'Browser Operator',
    category: 'Computer Use',
    status: 'Beta',
    description: 'Navigate websites, collect UI context, and hand structured actions back to the runtime.',
    accent: 'from-violet-500/20 to-indigo-500/10',
  },
  {
    id: 'doc-writer',
    name: 'Doc Writer',
    category: 'Writing',
    status: 'Ready',
    description: 'Produce polished memos, specs, decks, and working documents from raw notes.',
    accent: 'from-amber-500/20 to-orange-500/10',
  },
  {
    id: 'ops-monitor',
    name: 'Ops Monitor',
    category: 'Monitoring',
    status: 'Ready',
    description: 'Watch recurring signals, summarize changes, and keep an operator-facing running digest.',
    accent: 'from-zinc-500/20 to-blue-500/10',
  },
  {
    id: 'data-synth',
    name: 'Data Synth',
    category: 'Data',
    status: 'Coming soon',
    description: 'Blend CSVs, connectors, and task context into reusable dashboards and reports.',
    accent: 'from-rose-500/20 to-pink-500/10',
  },
];

const recentProjects = [
  { title: 'Big Mac Index Explorer', type: 'App', color: 'from-emerald-600/30 via-emerald-900/20 to-zinc-950', accent: 'bg-emerald-400/70' },
  { title: 'MegaCap 50 Tracker', type: 'App', color: 'from-stone-200/90 via-stone-100/60 to-zinc-300/40', accent: 'bg-zinc-900/70' },
  { title: 'Diff Eq Lecture1', type: 'Presentation', color: 'from-blue-900/80 via-indigo-900/60 to-slate-950', accent: 'bg-blue-400/70' },
  { title: 'Macro Terminal', type: 'App', color: 'from-emerald-950 via-zinc-950 to-slate-950', accent: 'bg-emerald-500/70' },
];

const initialTaskState = {
  id: null,
  prompt: '',
  status: 'idle',
  summary: '',
  document: '',
  messages: [],
  logs: [],
  artifacts: [],
};

const defaultProviderSettings = {
  activeProvider: 'anthropic-sdk',
  providers: {
    'anthropic-sdk': {
      label: 'Anthropic Agent SDK',
      provider: 'anthropic-sdk',
      model: 'claude-sonnet-4',
      endpoint: 'http://localhost:8790',
      apiKey: '',
      enabled: false,
      comingSoon: true,
      description: 'Use a local Anthropic Agent SDK runtime or bridge process.',
    },
    codex: {
      label: 'ChatGPT Codex',
      provider: 'codex',
      model: 'gpt-5-codex',
      endpoint: 'https://api.openai.com/v1',
      apiKey: '',
      enabled: false,
      description: 'Use OpenAI or Codex-style Responses API backends.',
      oauth: null,
    },
    ollama: {
      label: 'Ollama API',
      provider: 'ollama',
      model: 'qwen2.5-coder:14b',
      endpoint: 'http://localhost:11434',
      apiKey: '',
      enabled: false,
      description: 'Use local open-weight models through the Ollama HTTP API.',
    },
  },
};

export default function App() {
  const [view, setView] = useState('home');
  const [activeTab, setActiveTab] = useState('editor');
  const [docContent, setDocContent] = useState('');
  const [docTitle, setDocTitle] = useState('New Project');
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [agentTask, setAgentTask] = useState(initialTaskState);
  const [logs, setLogs] = useState([]);
  const [userFiles, setUserFiles] = useState([]);
  const [activeChip, setActiveChip] = useState(null);
  const [connectors, setConnectors] = useState(defaultConnectors);
  const [connectorSearch, setConnectorSearch] = useState('');
  const [connectorFilter, setConnectorFilter] = useState('all');
  const [selectedConnector, setSelectedConnector] = useState(null);
  const [providerSettings, setProviderSettings] = useState(defaultProviderSettings);
  const [chatPaneWidth, setChatPaneWidth] = useState(450);
  const [isDraggingDivider, setIsDraggingDivider] = useState(false);
  const [isComposerMenuOpen, setIsComposerMenuOpen] = useState(false);
  const [composerMenuSection, setComposerMenuSection] = useState(null);
  const [sourceSelections, setSourceSelections] = useState({
    web: true,
    academic: false,
    social: false,
  });

  const chatEndRef = useRef(null);
  const pollRef = useRef(null);
  const taskLayoutRef = useRef(null);
  const composerMenuRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('openwork-provider-settings');
      if (!saved) return;
      const parsed = JSON.parse(saved);
      setProviderSettings({
        activeProvider: parsed.activeProvider || defaultProviderSettings.activeProvider,
        providers: {
          ...defaultProviderSettings.providers,
          ...(parsed.providers || {}),
        },
      });
    } catch {
      // Keep defaults if local storage is unavailable or malformed.
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem('openwork-provider-settings', JSON.stringify(providerSettings));
  }, [providerSettings]);

  useEffect(() => {
    const handleOAuthMessage = (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.source !== 'openwork-openai-oauth') return;

      if (event.data.ok && event.data.payload) {
        setProviderSettings((prev) => ({
          ...prev,
          activeProvider: 'codex',
          providers: {
            ...prev.providers,
            codex: {
              ...prev.providers.codex,
              oauth: {
                ...event.data.payload,
                connectedAt: new Date().toISOString(),
              },
            },
          },
        }));
        addLog('OpenAI OAuth connected for Codex.', 'info');
      } else {
        addLog(event.data?.error || 'OpenAI OAuth failed.', 'error');
      }
    };

    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, []);

  useEffect(() => {
    if (!isDraggingDivider) return undefined;

    const handleMouseMove = (event) => {
      const container = taskLayoutRef.current;
      if (!container) return;

      const bounds = container.getBoundingClientRect();
      const nextWidth = event.clientX - bounds.left - 12;
      const minWidth = 340;
      const maxWidth = Math.max(minWidth, bounds.width - 420);
      setChatPaneWidth(Math.min(Math.max(nextWidth, minWidth), maxWidth));
    };

    const handleMouseUp = () => {
      setIsDraggingDivider(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingDivider]);

  useEffect(() => {
    if (!isComposerMenuOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!composerMenuRef.current?.contains(event.target)) {
        setIsComposerMenuOpen(false);
        setComposerMenuSection(null);
      }
    };

    window.addEventListener('mousedown', handlePointerDown);
    return () => window.removeEventListener('mousedown', handlePointerDown);
  }, [isComposerMenuOpen]);

  useEffect(() => {
    if (!agentTask.id || agentTask.status === 'completed' || agentTask.status === 'failed') {
      if (pollRef.current) {
        window.clearTimeout(pollRef.current);
        pollRef.current = null;
      }
      return undefined;
    }

    const poll = async () => {
      try {
        const response = await fetch(`/api/tasks/${agentTask.id}`);
        if (!response.ok) {
          throw new Error('Failed to load task');
        }
        const data = await response.json();
        syncTaskToView(data.task);
      } catch (error) {
        addLog(error instanceof Error ? error.message : 'Network error.', 'error');
        setIsTyping(false);
      } finally {
        pollRef.current = window.setTimeout(poll, 1200);
      }
    };

    pollRef.current = window.setTimeout(poll, 1200);
    return () => {
      if (pollRef.current) {
        window.clearTimeout(pollRef.current);
      }
    };
  }, [agentTask.id, agentTask.status]);

  const addLog = (text, type = 'info') => {
    setLogs((prev) => [...prev, { type, text, time: new Date().toLocaleTimeString() }]);
  };

  const syncTaskToView = (task) => {
    setAgentTask(task);
    setDocContent(task.document || '');
    setMessages(task.messages || []);
    setLogs(task.logs || []);
    setIsTyping(task.status === 'running');

    if (task.status === 'completed' && task.artifacts?.length) {
      setUserFiles((prev) => {
        const next = [...prev];
        task.artifacts.forEach((artifact, index) => {
          const id = `${task.id}-${artifact.name}-${index}`;
          if (!next.some((item) => item.id === id)) {
            next.unshift({
              id,
              title: artifact.name,
              content: task.document || artifact.description,
              date: new Date().toLocaleDateString(),
            });
          }
        });
        return next;
      });
    }
  };

  const handleStartTask = async (textOverride = null) => {
    const query = (textOverride || inputValue).trim();
    if (!query) return;

    if (activeProviderConfig.comingSoon) {
      addLog(`${activeProviderConfig.label} is coming soon. Choose another provider in Settings.`, 'error');
      return;
    }

    const nextTitle = query.length > 25 ? `${query.substring(0, 25)}...` : query;
    setInputValue('');
    setView('active-task');
    setIsTyping(true);
    setDocTitle(nextTitle);
    setMessages([{ role: 'user', content: query }]);
    setAgentTask({ ...initialTaskState, status: 'running', prompt: query, summary: 'Initializing workspace...' });
    addLog(`Task: ${query}`, 'system');
    addLog(`Provider: ${activeProviderConfig.label} (${activeProviderConfig.model})`, 'info');

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          provider: activeProviderConfig.provider,
          model: activeProviderConfig.model,
          mode: 'computer-use',
          endpoint: activeProviderConfig.endpoint,
          apiKey: activeProviderConfig.apiKey,
          oauthAccessToken: activeProviderConfig.oauth?.accessToken || '',
        }),
      });
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const data = await response.json();
      syncTaskToView(data.task);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Network error.';
      addLog(message, 'error');
      setMessages((prev) => [...prev, { role: 'assistant', content: `Something went wrong: ${message}` }]);
      setIsTyping(false);
    }
  };

  const toggleChip = (chip) => {
    if (chip === 'use-cases') {
      setView('use-cases');
      return;
    }
    setActiveChip(activeChip === chip ? null : chip);
  };

  const updateProviderSetting = (providerId, field, value) => {
    setProviderSettings((prev) => ({
      ...prev,
      providers: {
        ...prev.providers,
        [providerId]: {
          ...prev.providers[providerId],
          [field]: value,
        },
      },
    }));
  };

  const activeProviderConfig = providerSettings.providers[providerSettings.activeProvider];

  const toggleSourceSelection = (key) => {
    setSourceSelections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const startOpenAIOAuth = async () => {
    try {
      const response = await fetch('/api/auth/openai/start');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to start OAuth.');
      }

      window.open(data.url, 'openwork-openai-oauth', 'width=560,height=760');
    } catch (error) {
      addLog(error instanceof Error ? error.message : 'Failed to start OAuth.', 'error');
    }
  };

  const visibleConnectors = connectors.filter((connector) => {
    const matchesSearch =
      connector.name.toLowerCase().includes(connectorSearch.toLowerCase()) ||
      connector.desc.toLowerCase().includes(connectorSearch.toLowerCase());

    const matchesFilter = connectorFilter === 'all' || connector.status === connectorFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex h-screen w-full overflow-hidden bg-black p-[1px] text-zinc-300">
      <div className="relative flex h-full w-full overflow-hidden rounded-[18px] border border-zinc-800/80 bg-[#050505] shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
      <aside className="z-20 flex w-[255px] flex-col border-r border-zinc-900 bg-[#070707]">
        <div className="flex h-full flex-col px-4 py-5">
          <div className="space-y-1">
            <NavItem icon={<MessageSquare className="h-4 w-4" />} label="Chat" subtle />
            <NavItem
              icon={<Monitor className="h-4 w-4" />}
              label="OpenWork"
              active={view === 'home' || view === 'active-task'}
              onClick={() => {
                setView('home');
                setActiveChip(null);
              }}
            />
          </div>

          <div className="mt-8 space-y-1">
            <h3 className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-600">Workspace</h3>
            <NavItem
              icon={<Plus className="h-4 w-4" />}
              label="New task"
              onClick={() => {
                setView('home');
                setActiveChip(null);
              }}
            />
            <NavItem
              icon={<ListTodo className="h-4 w-4" />}
              label="Tasks"
              onClick={() => {
                setView('home');
                setActiveChip(null);
              }}
            />
            <NavItem icon={<FileCode className="h-4 w-4" />} label="Files" active={view === 'files'} onClick={() => setView('files')} />
            <NavItem icon={<Share2 className="h-4 w-4" />} label="Connectors" active={view === 'connectors'} onClick={() => setView('connectors')} />
            <NavItem icon={<Zap className="h-4 w-4" />} label="Skills" active={view === 'skills'} onClick={() => setView('skills')} />
            <NavItem icon={<LayoutGrid className="h-4 w-4" />} label="Use cases" active={view === 'use-cases'} onClick={() => setView('use-cases')} />
          </div>

          <div className="mt-auto border-t border-zinc-900 pt-4 text-xs">
            <button
              onClick={() => setView('settings')}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 transition-colors ${view === 'settings' ? 'bg-zinc-900 text-white' : 'text-zinc-400 hover:text-white'}`}
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900/70">
                <Settings className="h-3 w-3" />
              </div>
              Settings
            </button>
          </div>
        </div>
      </aside>

      <main className="relative flex flex-1 flex-col overflow-hidden">
        {view === 'home' && (
          <div className="animate-in fade-in relative flex flex-1 flex-col px-7 pb-16 pt-8 duration-700">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03),transparent_60%)]" />
            <div className="mx-auto flex w-full max-w-[980px] flex-1 flex-col justify-center">
            <h1 className="mb-10 text-center font-serif text-[48px] leading-none tracking-[-0.05em] text-white md:text-[60px]">
              Delegate the busywork.
            </h1>

            <div className="mb-8 w-full rounded-[28px] border border-zinc-800 bg-[#1b1918] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.5)] transition-all focus-within:border-zinc-600">
              <form onSubmit={(e) => { e.preventDefault(); handleStartTask(); }} className="flex min-h-[116px] flex-col justify-between gap-4 px-3 py-2">
                <div className="flex items-start gap-3">
                  <input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="What should we work on next?"
                    className="flex-1 border-none bg-transparent pt-1 text-[17px] text-white outline-none placeholder:text-zinc-600 focus:outline-none focus:ring-0"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div ref={composerMenuRef} className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setIsComposerMenuOpen((prev) => !prev);
                        setComposerMenuSection(null);
                      }}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/6 text-zinc-500 transition hover:text-white"
                    >
                      <Plus className="h-5 w-5" />
                    </button>

                    {isComposerMenuOpen && (
                      <div className="absolute left-0 top-12 z-30 flex gap-2">
                        <div className="w-[280px] overflow-hidden rounded-[20px] border border-zinc-800 bg-[#191919] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.45)]">
                          <ComposerMenuItem icon={Paperclip} label="Upload files or images" />
                          <ComposerMenuItem
                            icon={Share2}
                            label="Connectors and sources"
                            active={composerMenuSection === 'sources'}
                            onHover={() => setComposerMenuSection('sources')}
                          />
                          <ComposerMenuItem icon={Zap} label="Use skills" />
                          <ComposerMenuItem icon={Cpu} label="Select orchestrator model" />
                        </div>

                        {composerMenuSection === 'sources' && (
                          <div className="w-[290px] rounded-[20px] border border-blue-500/30 bg-[#1b1c1f] p-3 shadow-[0_20px_50px_rgba(0,0,0,0.45)]">
                            <div className="mb-3 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-zinc-200">
                              <div className="flex items-center justify-between gap-3">
                                <span>Upgrade to connect more sources</span>
                                <ArrowRight className="h-4 w-4 text-blue-300" />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <SourceOption
                                icon={Globe}
                                label="Web"
                                checked={sourceSelections.web}
                                onClick={() => toggleSourceSelection('web')}
                              />
                              <SourceOption
                                icon={GraduationCap}
                                label="Academic"
                                checked={sourceSelections.academic}
                                onClick={() => toggleSourceSelection('academic')}
                              />
                              <SourceOption
                                icon={Network}
                                label="Social"
                                checked={sourceSelections.social}
                                onClick={() => toggleSourceSelection('social')}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <button type="button" className="text-zinc-500 hover:text-white">
                      <Mic className="h-4 w-4" />
                    </button>
                    <button type="submit" className="rounded-full bg-white p-3 text-black transition-colors hover:bg-zinc-200">
                      <Volume2 className="h-5 w-5 text-black" style={{ stroke: '#000000' }} />
                    </button>
                  </div>
                </div>
              </form>
            </div>

            <div className="mb-12 flex flex-wrap justify-center gap-2.5">
              <QuickChip icon={<LayoutGrid />} label="Use cases" onClick={() => toggleChip('use-cases')} />
              <QuickChip icon={<Sparkles />} label="Help me learn" active={activeChip === 'learn'} onClick={() => toggleChip('learn')} />
              <QuickChip icon={<Briefcase />} label="Organize my work" active={activeChip === 'business'} onClick={() => toggleChip('business')} />
              <QuickChip icon={<Eye />} label="Monitor the situation" active={activeChip === 'monitor'} onClick={() => toggleChip('monitor')} />
            </div>

            {activeChip && promptGroups[activeChip] && (
              <div className="animate-in slide-in-from-top-2 mt-2 flex w-full max-w-xl flex-col gap-1 duration-300">
                {promptGroups[activeChip].map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleStartTask(prompt)}
                    className="w-full rounded-xl px-4 py-2.5 text-left text-sm text-zinc-400 transition-all hover:bg-white/5 hover:text-white"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {!activeChip && (
              <div className="animate-in fade-in w-full duration-1000">
                <div className="mb-5 flex items-center justify-between px-1">
                  <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">Recent Activity</h2>
                  <div className="flex items-center gap-6 text-sm text-zinc-500">
                    <button className="transition hover:text-white">View all</button>
                    <button className="transition hover:text-white">Shuffle</button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {recentProjects.map((project, index) => (
                    <ProjectCard key={index} {...project} />
                  ))}
                </div>
              </div>
            )}
            </div>
          </div>
        )}

        {view === 'use-cases' && (
          <div className="flex flex-1 flex-col overflow-y-auto bg-[#050505] p-8 md:p-12">
            <header className="mx-auto mb-10 flex w-full max-w-7xl flex-col justify-between gap-6 md:flex-row md:items-center">
              <div>
                <h1 className="mb-2 text-3xl text-white">Use cases</h1>
                <p className="text-sm text-zinc-500">See use cases of what you could build with OpenWork</p>
              </div>
              <button
                onClick={() => setView('home')}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-white/10"
              >
                <MousePointer2 className="h-3 w-3" /> PUT OPENWORK TO WORK
              </button>
            </header>
            <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-6">
              {useCases.map((useCase, index) => (
                <button key={index} className="group flex flex-col text-left">
                  <div className={`relative mb-3 aspect-[4/3] overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-br ${useCase.color} shadow-xl transition-all group-hover:scale-[1.03] group-hover:border-zinc-500`}>
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-[2px] transition-opacity group-hover:opacity-100">
                      <div className="rounded-full bg-white p-2 text-black shadow-2xl">
                        <ArrowRight className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                  <h4 className="mb-1 text-[13px] font-semibold leading-snug text-zinc-200">{useCase.title}</h4>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">{useCase.type}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {view === 'active-task' && (
          <div className="animate-in slide-in-from-bottom-4 flex flex-1 flex-col bg-[#171412] duration-500">
            <header className="flex h-14 items-center justify-between border-b border-zinc-800 bg-[#1b1715] px-5">
              <div className="flex items-center gap-3 text-zinc-400">
                <Cpu className="h-4 w-4" />
                <span className="text-sm font-medium">Made with OpenWork</span>
              </div>
              <div className="flex items-center gap-3">
                <button className="rounded-xl border border-zinc-700 bg-[#111] px-4 py-2 text-sm text-white transition hover:bg-[#171717]">
                  Build your own
                </button>
                <button className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-zinc-200">
                  Copy link
                </button>
              </div>
            </header>
            <div ref={taskLayoutRef} className="flex flex-1 gap-2 overflow-hidden p-3">
              <div
                className="flex min-h-0 shrink-0 flex-col rounded-[18px] border border-zinc-800 bg-[#1b1715]"
                style={{ width: `${chatPaneWidth}px` }}
              >
                <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
                  <h2 className="truncate text-[28px] font-medium tracking-[-0.04em] text-white">{docTitle}</h2>
                  <div className="flex items-center gap-2">
                    <button className="rounded-xl border border-zinc-700 bg-[#171717] px-3 py-2 text-sm text-white">5</button>
                    <button className="rounded-xl border border-zinc-700 bg-[#171717] px-3 py-2 text-sm text-zinc-400">⋮</button>
                  </div>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
                  <div className="mb-6 space-y-4 text-[17px] leading-[1.65] text-zinc-200">
                    <p>{agentTask.summary || 'Spillover effects are real but modest so far. The active workspace keeps the reasoning trail on the left and the live artifact on the right.'}</p>
                    <div>
                      <h3 className="mb-2 text-[18px] font-medium text-white">Interactive features</h3>
                      <ul className="space-y-2 pl-5 text-zinc-300">
                        <li className="list-disc">Live workspace preview with cards, tabs, and a visual panel</li>
                        <li className="list-disc">Task narrative and system notes remain visible while the artifact updates</li>
                        <li className="list-disc">Terminal and document output continue streaming into the same run</li>
                        <li className="list-disc">The right panel can become a real browser or app surface for computer use</li>
                      </ul>
                    </div>
                  </div>

                  <div className="mb-4 flex items-center gap-3 rounded-2xl border border-zinc-800 bg-[#15181d] p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#101318]">
                      <Cpu className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-lg font-medium text-white">{docTitle}</p>
                      <p className="text-sm text-zinc-500">Live workspace preview</p>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs">
                    {messages.map((message, index) => (
                      <div key={index} className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-full rounded-2xl px-4 py-3 ${message.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-zinc-900 text-zinc-300'}`}>
                          {message.content}
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                </div>
                <div className="border-t border-zinc-800 p-4">
                  <form onSubmit={(e) => { e.preventDefault(); handleStartTask(); }}>
                    <input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Reply to agent..."
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </form>
                </div>
              </div>

              <button
                type="button"
                aria-label="Resize panels"
                onMouseDown={() => setIsDraggingDivider(true)}
                className={`group relative w-2 shrink-0 rounded-full bg-transparent ${isDraggingDivider ? 'cursor-col-resize' : 'cursor-col-resize'}`}
              >
                <span className={`absolute inset-y-0 left-1/2 w-px -translate-x-1/2 rounded-full bg-zinc-800 transition ${isDraggingDivider ? 'bg-blue-500' : 'group-hover:bg-zinc-600'}`} />
              </button>

              <div className="min-h-0 flex-1 overflow-hidden rounded-[18px] border border-zinc-800 bg-[#11141c]">
                <div className="flex items-center justify-between border-b border-zinc-700 bg-[#171a24] px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md border border-blue-500/40 bg-blue-500/10">
                      <Monitor className="h-4 w-4 text-blue-400" />
                    </div>
                    <h3 className="text-[20px] font-semibold tracking-[-0.03em] text-white">{docTitle}</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-blue-500/10 px-4 py-2 text-sm text-zinc-300">{activeTaskBadge(agentTask)}</span>
                    {isTyping && <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />}
                  </div>
                </div>

                <div className="h-full overflow-y-auto px-6 py-6">
                  <div className="mb-6 grid gap-4 xl:grid-cols-4">
                    {buildPreviewCards(agentTask, docTitle).map((card) => (
                      <div key={card.label} className="rounded-2xl border border-zinc-700 bg-[#171a24] p-5">
                        <div className={`text-[26px] font-semibold tracking-[-0.04em] ${card.valueClass}`}>{card.value}</div>
                        <div className="mt-3 text-[15px] font-medium text-zinc-200">{card.label}</div>
                        <div className="mt-2 text-sm leading-6 text-zinc-500">{card.subtext}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mb-4 flex items-center gap-3">
                    <span className="text-[15px] font-medium text-zinc-400">View</span>
                    <div className="flex rounded-xl border border-zinc-700 bg-[#171a24] p-1">
                      {buildPreviewTabs(agentTask).map((tab, index) => (
                        <PreviewTab key={tab} active={index === 0} label={tab} />
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[20px] border border-zinc-700 bg-[#171a24] p-5">
                    <div className="relative h-[620px] overflow-hidden rounded-[18px] bg-[radial-gradient(circle_at_50%_20%,rgba(60,84,140,0.15),transparent_35%),linear-gradient(180deg,#1b1e28_0%,#171922_100%)]">
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:72px_72px] opacity-20" />
                      <div className="absolute left-[10%] top-[16%] h-[68%] w-[78%] rounded-[48%] border border-zinc-700/50 opacity-20" />
                      <div className="absolute left-[14%] top-[18%] h-28 w-40 rounded-[24px] border border-blue-500/10 bg-blue-500/10 blur-[2px]" />
                      <div className="absolute right-[12%] top-[22%] h-36 w-52 rounded-[28px] border border-indigo-400/10 bg-indigo-400/10 blur-[2px]" />
                      <div className="absolute left-[28%] top-[57%] h-32 w-24 rounded bg-blue-500/25 shadow-[0_0_0_1px_rgba(96,165,250,0.12)]" />
                      <div className="absolute left-[64%] top-[46%] h-24 w-16 rounded bg-blue-400/15 shadow-[0_0_0_1px_rgba(96,165,250,0.12)]" />
                      <div className="absolute left-[73%] top-[39%] h-20 w-24 rounded-[40px] bg-blue-400/25 shadow-[0_0_0_1px_rgba(96,165,250,0.12)]" />
                      <div className="absolute inset-x-[16%] top-[30%] rounded-[30px] border border-zinc-700/40 bg-[#131722]/55 px-6 py-5 backdrop-blur-sm">
                        <p className="text-xs font-bold uppercase tracking-[0.24em] text-zinc-500">Workspace canvas</p>
                        <h4 className="mt-3 text-2xl font-medium tracking-[-0.04em] text-white">{docTitle}</h4>
                        <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
                          {agentTask.summary || 'The live artifact panel adapts to the current task. Connect a browser, a local runtime, or your preferred model backend to turn this canvas into an interactive app surface.'}
                        </p>
                      </div>
                      <div className="absolute bottom-5 left-5 w-[320px] rounded-2xl border border-zinc-700 bg-[#1a1d27]/95 p-4 shadow-xl">
                        <p className="text-lg font-medium text-white">{buildLegend(agentTask).title}</p>
                        <div className="mt-4 h-4 rounded-full bg-[linear-gradient(90deg,#1e293b_0%,#2d4f7d_18%,#35689e_36%,#4f8dc1_60%,#8bb6da_100%)]" />
                        <div className="mt-3 flex justify-between text-[28px] tracking-[-0.04em] text-zinc-400">
                          <span>{buildLegend(agentTask).min}</span>
                          <span>{buildLegend(agentTask).max}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {activeTab === 'terminal' && (
                    <div className="mt-6 rounded-2xl border border-zinc-700 bg-[#0d1016] p-4 font-mono text-xs text-zinc-300">
                      {logs.map((log, index) => (
                        <div key={`${log.time}-${index}`} className="flex gap-4 py-1">
                          <span className="whitespace-nowrap text-zinc-600">[{log.time}]</span>
                          <span className={log.type === 'error' ? 'text-red-400' : 'text-zinc-400'}>{log.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'connectors' && (
          <div className="animate-in fade-in flex-1 overflow-y-auto p-8 duration-500 md:p-12">
            <div className="mx-auto max-w-[1080px]">
              <div className="mb-10 flex flex-col gap-6 border-b border-zinc-900 pb-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="mb-2 text-3xl text-white">Connectors</h1>
                  <p className="text-sm text-zinc-500">Connect your apps and services so OpenWork can access and act on your data.</p>
                </div>
                <label className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-[#101010] px-4 py-3 text-sm text-zinc-500 md:w-[320px]">
                  <Search className="h-4 w-4" />
                  <input
                    value={connectorSearch}
                    onChange={(e) => setConnectorSearch(e.target.value)}
                    placeholder="Search all connectors"
                    className="w-full bg-transparent outline-none placeholder:text-zinc-600"
                  />
                </label>
              </div>

              <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex gap-2">
                  <FilterTab active={connectorFilter === 'all'} label="All" onClick={() => setConnectorFilter('all')} />
                  <FilterTab active={connectorFilter === 'connected'} label="Connected" onClick={() => setConnectorFilter('connected')} />
                  <FilterTab active={connectorFilter === 'available'} label="Available" onClick={() => setConnectorFilter('available')} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {visibleConnectors.map((connector) => (
                  <ConnectorCard key={connector.id} {...connector} onClick={() => setSelectedConnector(connector)} />
                ))}
              </div>
            </div>

            {selectedConnector && (
              <ConnectorModal connector={selectedConnector} onClose={() => setSelectedConnector(null)} />
            )}
          </div>
        )}

        {view === 'skills' && (
          <div className="animate-in fade-in flex-1 overflow-y-auto p-8 duration-500 md:p-12">
            <div className="mx-auto max-w-[1080px]">
              <div className="mb-10">
                <h1 className="mb-2 text-3xl text-white">Skills</h1>
                <p className="text-sm text-zinc-500">Reusable task patterns that help OpenWork research, build, monitor, and operate across tools.</p>
              </div>

              <div className="mb-8 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-[28px] border border-zinc-800 bg-[#111113] p-6">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">Skill system</p>
                  <h2 className="mt-3 text-2xl font-medium tracking-[-0.04em] text-white">Give the agent repeatable ways to work.</h2>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400">
                    Skills package prompts, workflows, and tool expectations into reusable operating modes. Use them to keep runs consistent whether you are researching, coding, drafting, or monitoring.
                  </p>
                </div>

                <div className="rounded-[28px] border border-zinc-800 bg-[#111113] p-6">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">Included</p>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-2xl border border-zinc-800 bg-[#151518] px-4 py-3 text-sm text-zinc-300">Prompt scaffolds</div>
                    <div className="rounded-2xl border border-zinc-800 bg-[#151518] px-4 py-3 text-sm text-zinc-300">Tool routing defaults</div>
                    <div className="rounded-2xl border border-zinc-800 bg-[#151518] px-4 py-3 text-sm text-zinc-300">Task-specific output formats</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {skills.map((skill) => (
                  <SkillCard key={skill.id} {...skill} />
                ))}
              </div>
            </div>
          </div>
        )}

        {view === 'files' && (
          <div className="animate-in fade-in flex-1 overflow-y-auto p-8 duration-500 md:p-12">
            <h1 className="mb-2 text-3xl text-white">Files</h1>
            <p className="mb-10 text-sm text-zinc-500">Browse assets generated by your agentic tasks.</p>
            {userFiles.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-900 bg-[#080808]/30 py-20 text-center">
                <FolderOpen className="mb-6 h-8 w-8 text-zinc-600" />
                <p className="mb-6 text-sm text-zinc-500">No files yet.</p>
                <button onClick={() => setView('home')} className="rounded-full bg-white px-6 py-3 text-xs font-bold uppercase text-black transition-all hover:bg-zinc-200">
                  New OpenWork Task
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {userFiles.map((file) => (
                  <div key={file.id} className="rounded-2xl border border-zinc-800 bg-[#0e0e0e] p-4">
                    <div className="mb-4 flex aspect-square items-center justify-center rounded-xl bg-zinc-900">
                      <FileText className="h-12 w-12 text-zinc-700" />
                    </div>
                    <h4 className="truncate text-sm font-semibold text-zinc-200">{file.title}</h4>
                    <p className="mt-1 text-[10px] uppercase tracking-widest text-zinc-600">{file.date}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === 'settings' && (
          <div className="animate-in fade-in flex-1 overflow-y-auto p-8 duration-500 md:p-12">
            <div className="mx-auto max-w-5xl">
              <h1 className="mb-2 text-3xl text-white">Settings</h1>
              <p className="mb-10 text-sm text-zinc-500">Choose which runtime powers OpenWork: Anthropic Agent SDK, ChatGPT Codex, or a local Ollama API.</p>

              <div className="mb-8 grid gap-4 md:grid-cols-3">
                {Object.entries(providerSettings.providers).map(([providerId, config]) => (
                  <button
                    key={providerId}
                    onClick={() => {
                      if (config.comingSoon) return;
                      setProviderSettings((prev) => ({ ...prev, activeProvider: providerId }));
                    }}
                    className={`rounded-3xl border p-5 text-left transition-all ${
                      config.comingSoon
                        ? 'border-zinc-800 bg-[#0a0a0c] opacity-45'
                        : providerSettings.activeProvider === providerId
                          ? 'border-blue-500/40 bg-blue-500/10'
                          : 'border-zinc-800 bg-[#0d0d0f] hover:bg-[#121215]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-medium text-white">{config.label}</h2>
                        <p className="mt-2 text-sm leading-6 text-zinc-400">{config.description}</p>
                      </div>
                      <span className={`mt-1 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-widest ${config.comingSoon ? 'bg-zinc-800 text-zinc-400' : config.enabled ? 'bg-emerald-400/20 text-emerald-300' : 'bg-zinc-800 text-zinc-500'}`}>
                        {config.comingSoon ? 'Coming soon' : config.enabled ? 'Ready' : 'Off'}
                      </span>
                    </div>
                    <div className="mt-4 text-xs uppercase tracking-widest text-zinc-500">{config.model}</div>
                  </button>
                ))}
              </div>

              <div className="rounded-[28px] border border-zinc-800 bg-[#0d0d0f] p-6">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-medium text-white">{activeProviderConfig.label}</h2>
                    <p className="mt-2 text-sm leading-6 text-zinc-400">{activeProviderConfig.description}</p>
                  </div>
                  <label className="flex items-center gap-3 rounded-full border border-zinc-700 bg-[#141418] px-4 py-2 text-sm text-zinc-300">
                    <input
                      type="checkbox"
                      checked={activeProviderConfig.enabled}
                      onChange={(e) => updateProviderSetting(providerSettings.activeProvider, 'enabled', e.target.checked)}
                    />
                    Enabled
                  </label>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">Provider name</span>
                    <input
                      value={activeProviderConfig.label}
                      onChange={(e) => updateProviderSetting(providerSettings.activeProvider, 'label', e.target.value)}
                      className="w-full rounded-2xl border border-zinc-800 bg-[#141418] px-4 py-3 text-sm text-white outline-none focus:border-zinc-600"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">Model</span>
                    <input
                      value={activeProviderConfig.model}
                      onChange={(e) => updateProviderSetting(providerSettings.activeProvider, 'model', e.target.value)}
                      className="w-full rounded-2xl border border-zinc-800 bg-[#141418] px-4 py-3 text-sm text-white outline-none focus:border-zinc-600"
                    />
                  </label>

                  <label className="space-y-2 md:col-span-2">
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">Endpoint</span>
                    <input
                      value={activeProviderConfig.endpoint}
                      onChange={(e) => updateProviderSetting(providerSettings.activeProvider, 'endpoint', e.target.value)}
                      className="w-full rounded-2xl border border-zinc-800 bg-[#141418] px-4 py-3 text-sm text-white outline-none focus:border-zinc-600"
                    />
                  </label>

                  <label className="space-y-2 md:col-span-2">
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">API key / token</span>
                    <input
                      type="password"
                      value={activeProviderConfig.apiKey}
                      onChange={(e) => updateProviderSetting(providerSettings.activeProvider, 'apiKey', e.target.value)}
                      placeholder="Stored locally in this desktop app"
                      className="w-full rounded-2xl border border-zinc-800 bg-[#141418] px-4 py-3 text-sm text-white outline-none focus:border-zinc-600"
                    />
                  </label>
                </div>

                <div className="mt-6 rounded-2xl border border-zinc-800 bg-[#121217] p-4 text-sm leading-6 text-zinc-400">
                  <span className="font-medium text-zinc-200">Current launch target:</span> {activeProviderConfig.label} using `{activeProviderConfig.model}` at `{activeProviderConfig.endpoint}`
                </div>

                {providerSettings.activeProvider === 'codex' && (
                  <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm leading-6 text-amber-100">
                    OpenClaw-style OAuth is now scaffolded behind OpenWork env vars. Configure an OpenAI OAuth client for OpenWork, then connect below. API keys still work as the fallback.
                  </div>
                )}

                {providerSettings.activeProvider === 'codex' && (
                  <div className="mt-4 rounded-2xl border border-zinc-800 bg-[#121217] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-medium text-white">OpenAI OAuth</h3>
                        <p className="mt-1 text-sm text-zinc-400">Use a PKCE browser login flow similar to OpenClaw.</p>
                      </div>
                      <button
                        type="button"
                        onClick={startOpenAIOAuth}
                        className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-zinc-200"
                      >
                        Connect OpenAI
                      </button>
                    </div>
                    <div className="mt-4 text-sm text-zinc-400">
                      {activeProviderConfig.oauth?.accessToken
                        ? `Connected via OAuth${activeProviderConfig.oauth.connectedAt ? ` on ${new Date(activeProviderConfig.oauth.connectedAt).toLocaleString()}` : ''}.`
                        : 'No OAuth token connected yet.'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      </div>
    </div>
  );
}

const NavItem = ({ icon, label, active = false, onClick, subtle = false }) => (
  <button
    onClick={onClick}
    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${active ? 'bg-[#1c1c20] text-white shadow-sm' : subtle ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-500 hover:bg-zinc-900/50 hover:text-zinc-300'}`}
  >
    {icon} {label}
  </button>
);

const QuickChip = ({ icon, label, onClick, active }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 rounded-full border px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.08em] transition-all ${active ? 'border-zinc-600 bg-zinc-800 text-white' : 'border-zinc-800 bg-[#111] text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
  >
    {React.cloneElement(icon, { className: 'h-3 w-3' })} {label}
  </button>
);

const ComposerMenuItem = ({ icon: Icon, label, onHover, active = false }) => (
  <button
    type="button"
    onMouseEnter={onHover}
    className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-[15px] transition ${active ? 'bg-[#232324] text-white' : 'text-zinc-200 hover:bg-[#232324]'}`}
  >
    <span className="flex items-center gap-3">
      <Icon className="h-4 w-4 text-zinc-400" />
      {label}
    </span>
    <ChevronRight className="h-4 w-4 text-zinc-500" />
  </button>
);

const SourceOption = ({ icon: Icon, label, checked, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-[15px] text-zinc-200 transition hover:bg-[#232324]"
  >
    <span className="flex items-center gap-3">
      <Icon className="h-4 w-4 text-zinc-400" />
      {label}
    </span>
    <span className={`flex h-5 w-5 items-center justify-center rounded-md border ${checked ? 'border-blue-400 bg-blue-400 text-black' : 'border-zinc-700 bg-transparent text-transparent'}`}>
      <Check className="h-3.5 w-3.5" />
    </span>
  </button>
);

const SkillCard = ({ name, category, status, description, accent }) => (
  <button className="rounded-[24px] border border-zinc-800 bg-[#0f1012] p-5 text-left transition hover:bg-[#15161a]">
    <div className={`mb-5 aspect-[1.8/1] rounded-2xl border border-zinc-800 bg-gradient-to-br ${accent} p-4`}>
      <div className="flex h-full flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-200">
            {category}
          </span>
          <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${status === 'Ready' ? 'bg-emerald-400/20 text-emerald-300' : status === 'Beta' ? 'bg-blue-400/20 text-blue-300' : 'bg-zinc-900/50 text-zinc-400'}`}>
            {status}
          </span>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/20">
          <Zap className="h-5 w-5 text-white/80" />
        </div>
      </div>
    </div>
    <h3 className="text-lg font-medium text-white">{name}</h3>
    <p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p>
  </button>
);

const ProjectCard = ({ title, type, color, accent }) => (
  <button className="group text-left">
    <div className={`relative mb-3 aspect-[1.28/1] overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-br ${color} transition-all group-hover:border-zinc-600`}>
      <div className="absolute inset-0 bg-black/12" />
      <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white/8 to-transparent opacity-50" />
      <div className="absolute bottom-4 left-4">
        <div className={`rounded-lg border border-white/5 ${accent || 'bg-black/45'} p-2 backdrop-blur-md`}>
          <Terminal className="h-4 w-4 text-white/50" />
        </div>
      </div>
      <div className="absolute left-4 top-4 h-1.5 w-16 rounded-full bg-white/10" />
      <div className="absolute right-4 top-4 h-1.5 w-10 rounded-full bg-white/10" />
    </div>
    <h4 className="truncate text-[15px] font-medium text-zinc-100">{title}</h4>
    <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-zinc-500">{type}</p>
  </button>
);

const ConnectorCard = ({ name, desc, icon, status, onClick }) => (
  <button onClick={onClick} className="flex flex-col rounded-2xl border border-zinc-800 bg-[#0e0e0e] p-5 text-left transition-all hover:bg-[#151515]">
    <div className="mb-4 flex items-start justify-between">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-2.5">
        {React.cloneElement(icon, { className: `${icon.props.className} h-6 w-6` })}
      </div>
      {status === 'connected' && <span className="flex h-2 w-2 rounded-full bg-emerald-500" />}
    </div>
    <h3 className="mb-1 text-sm font-semibold text-white">{name}</h3>
    <p className="line-clamp-2 text-xs leading-relaxed text-zinc-500">{desc}</p>
  </button>
);

const ConnectorModal = ({ connector, onClose }) => (
  <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4 backdrop-blur-[2px]">
    <div className="w-full max-w-[720px] rounded-[28px] border border-zinc-800 bg-[#171414] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.7)]">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-800 bg-[#15171b]">
            {React.cloneElement(connector.icon, { className: `${connector.icon.props.className} h-7 w-7` })}
          </div>
          <div>
            <h2 className="text-[34px] font-medium tracking-[-0.04em] text-white">{connector.name}</h2>
            <p className="mt-1 max-w-xl text-base text-zinc-400">{connector.desc}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-zinc-200">
            {connector.status === 'connected' ? 'Manage connector' : 'Add connector'}
          </button>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 bg-transparent text-zinc-400 transition hover:border-zinc-500 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr]">
        <div>
          <h3 className="mb-3 text-2xl font-medium text-white">Overview</h3>
          <ul className="space-y-2 text-base leading-7 text-zinc-300">
            {connector.features.map((feature) => (
              <li key={feature} className="flex gap-3">
                <span className="mt-[10px] h-1.5 w-1.5 rounded-full bg-zinc-400" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-6">
          <div>
            <h4 className="mb-3 text-xl font-medium text-white">Links</h4>
            <div className="space-y-2">
              <a href={connector.website} className="block text-base text-blue-400 transition hover:text-blue-300">
                Website
              </a>
              <a href={connector.support} className="block text-base text-blue-400 transition hover:text-blue-300">
                Support
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-xl font-medium text-white">Developed by</h4>
            <p className="text-base text-zinc-400">{connector.developer}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const TabButton = ({ active, label, onClick }) => (
  <button
    onClick={onClick}
    className={`rounded-md px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all ${active ? 'bg-white text-black' : 'text-zinc-500 hover:text-zinc-300'}`}
  >
    {label}
  </button>
);

const PreviewTab = ({ active = false, label }) => (
  <button
    className={`rounded-lg px-4 py-2 text-[15px] transition ${active ? 'bg-[#22314d] text-blue-400' : 'text-zinc-400 hover:text-white'}`}
  >
    {label}
  </button>
);

const FilterTab = ({ active, label, onClick }) => (
  <button
    onClick={onClick}
    className={`rounded-lg px-4 py-2 text-[11px] font-bold uppercase tracking-widest transition-all ${active ? 'bg-zinc-800 text-white' : 'border border-zinc-800 bg-[#111] text-zinc-500 hover:text-zinc-300'}`}
  >
    {label}
  </button>
);

const defaultConnectors = [
  {
    id: 'gmail',
    name: 'Gmail with Calendar',
    desc: 'Search, create, and manage your emails and calendar events.',
    icon: <Mail className="text-red-400" />,
    status: 'available',
    developer: 'Google',
    website: '#',
    support: '#',
    features: [
      'Search your Gmail and calendar',
      'Draft and send emails',
      'Manage and monitor emails and events',
      'Create and update calendar events',
      'Data is retrieved from and written back to Gmail and Gcal when tasks run',
    ],
  },
  {
    id: 'drive',
    name: 'Google Drive',
    desc: 'Access and search content from your Google Drive storage.',
    icon: <HardDrive className="text-yellow-400" />,
    status: 'connected',
    developer: 'Google',
    website: '#',
    support: '#',
    features: [
      'Search documents and folders',
      'Read supporting files for long-running tasks',
      'Attach source material to research and drafting workflows',
      'Use cloud docs as context for agentic runs',
    ],
  },
  {
    id: 'github',
    name: 'GitHub',
    desc: 'Search and manage your GitHub repositories and issues.',
    icon: <Github className="text-zinc-100" />,
    status: 'available',
    developer: 'GitHub',
    website: '#',
    support: '#',
    features: [
      'Read repositories and issues',
      'Inspect pull requests and diffs',
      'Support repo cowork and engineering review tasks',
      'Bring code context into the desktop workspace',
    ],
  },
  {
    id: 'slack',
    name: 'Slack',
    desc: 'Retrieve past messages across your Slack workspace.',
    icon: <Slack className="text-purple-400" />,
    status: 'connected',
    developer: 'Slack',
    website: '#',
    support: '#',
    features: [
      'Search channels and message history',
      'Pull team context into active tasks',
      'Summarize discussions and decisions',
      'Support research, operations, and monitoring workflows',
    ],
  },
];

const previewCards = [
  {
    value: '~131,000',
    valueClass: 'text-blue-400',
    label: 'Positions Eliminated or Vacated',
    subtext: '55K+ eliminated, 76K buyouts',
  },
  {
    value: '17+',
    valueClass: 'text-blue-400',
    label: 'Agencies Affected',
    subtext: 'DOD, IRS, VA, HHS, USDA, EPA...',
  },
  {
    value: '-55,900',
    valueClass: 'text-rose-400',
    label: 'DC Metro Jobs Lost (Dec 2025)',
    subtext: 'Largest metro decline nationwide',
  },
  {
    value: '2.6x',
    valueClass: 'text-blue-400',
    label: 'Spillover Multiplier',
    subtext: 'Each fed job supports ~2.6 local jobs',
  },
];

function activeTaskBadge(task) {
  if (task.provider === 'codex') return 'OpenAI Responses API';
  if (task.provider === 'ollama') return 'Local Ollama runtime';
  if (task.provider === 'anthropic-sdk') return 'Anthropic Agent SDK';
  return 'Connected workspace';
}

function buildPreviewCards(task, title) {
  const artifactCount = task.artifacts?.length ?? 0;
  const messageCount = task.messages?.length ?? 0;
  const logCount = task.logs?.length ?? 0;
  const stepCount = task.steps?.length ?? 0;

  return [
    {
      value: `~${Math.max(title.length * 1300, 24000).toLocaleString()}`,
      valueClass: 'text-blue-400',
      label: 'Context Tokens Routed',
      subtext: `Prompt, files, and tools prepared for ${task.provider || 'the active provider'}`,
    },
    {
      value: `${Math.max(stepCount, 1)}`,
      valueClass: 'text-blue-400',
      label: 'Execution Steps',
      subtext: `${Math.max(logCount, 1)} runtime log events captured`,
    },
    {
      value: `${artifactCount || 0}`,
      valueClass: artifactCount ? 'text-emerald-400' : 'text-zinc-300',
      label: 'Artifacts Produced',
      subtext: artifactCount ? 'Documents and traces ready to inspect' : 'Artifacts will appear as the run completes',
    },
    {
      value: `${messageCount || 1}x`,
      valueClass: 'text-blue-400',
      label: 'Conversation Depth',
      subtext: 'Interactive task narrative and assistant updates',
    },
  ];
}

function buildPreviewTabs(task) {
  if (task.mode === 'computer-use') {
    return ['Live Workspace', 'Browser Actions', 'Tool Trace'];
  }

  if (task.mode === 'research') {
    return ['Sources', 'Summary', 'Output'];
  }

  return ['Workspace', 'Artifacts', 'Timeline'];
}

function buildLegend(task) {
  if (task.mode === 'computer-use') {
    return {
      title: 'Tool Activity Density',
      min: 'Low',
      max: 'High',
    };
  }

  if (task.provider === 'ollama') {
    return {
      title: 'Local Runtime Utilization',
      min: 'Idle',
      max: 'Busy',
    };
  }

  return {
    title: 'Execution Confidence',
    min: 'Draft',
    max: 'Ready',
  };
}
