"use client";

import { PreviewMessage } from "@/components/message";
import { getDesktopURL } from "@/lib/cyberdesk/utils";
import { useScrollToBottom } from "@/lib/use-scroll-to-bottom";
import { useChat } from "@ai-sdk/react";
import { useEffect, useState } from "react";
import { Input } from "@/components/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ProjectInfo } from "@/components/project-info";
import { AISDKLogo } from "@/components/icons";
import { PromptSuggestions } from "@/components/prompt-suggestions";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ABORTED } from "@/lib/utils";
import { FaRocket } from "react-icons/fa";

// Helper to call the start-desktop API and return the id
async function startDesktopAPI() {
  const response = await fetch("/api/start-desktop", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Failed to start desktop");
  }
  const data = await response.json();
  return data.id;
}

// Shared polling helper for desktop URL
async function pollForDesktopURL(sandboxId: string | null | undefined) {
  let delay = 1000; // Start with 1 second
  const maxDelay = 5000; // Cap at 5 seconds
  const maxTime = 180000; // 3 minutes in ms
  const startTime = Date.now();

  while (true) {
    if (Date.now() - startTime > maxTime) {
      throw new Error("Timed out after 3 minutes while getting desktop stream URL.");
    }
    const { streamUrl, id } = await getDesktopURL(sandboxId || undefined);
    if (streamUrl) {
      return { streamUrl, id };
    }
    delay = Math.min(maxDelay, Math.floor(delay * 1.5));
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}

export default function Chat() {
  // Create separate refs for mobile and desktop to ensure both scroll properly
  const [desktopContainerRef, desktopEndRef] = useScrollToBottom();
  const [mobileContainerRef, mobileEndRef] = useScrollToBottom();

  const [isInitializing, setIsInitializing] = useState(false);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [sandboxId, setSandboxId] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    status,
    stop: stopGeneration,
    append,
    setMessages,
  } = useChat({
    api: "/api/chat",
    id: sandboxId ?? undefined,
    body: {
      sandboxId,
    },
    maxSteps: 30,
    onError: (error) => {
      console.error(error);
      toast.error("There was an error", {
        description: "Please try again later.",
        richColors: true,
        position: "top-center",
      });
    },
  });

  const stop = () => {
    stopGeneration();

    const lastMessage = messages.at(-1);
    const lastMessageLastPart = lastMessage?.parts.at(-1);
    if (
      lastMessage?.role === "assistant" &&
      lastMessageLastPart?.type === "tool-invocation"
    ) {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          ...lastMessage,
          parts: [
            ...lastMessage.parts.slice(0, -1),
            {
              ...lastMessageLastPart,
              toolInvocation: {
                ...lastMessageLastPart.toolInvocation,
                state: "result",
                result: ABORTED,
              },
            },
          ],
        },
      ]);
    }
  };

  const isLoading = status !== "ready";

  const refreshDesktop = async () => {
    try {
      setIsInitializing(true);
      const id = await startDesktopAPI();
      const { streamUrl } = await pollForDesktopURL(id);
      setStreamUrl(streamUrl);
      setSandboxId(id);
    } catch (err) {
      console.error("Failed to refresh desktop:", err);
    } finally {
      setIsInitializing(false);
    }
  };

  // Handler for Start Desktop button
  const handleStartDesktop = async () => {
    setHasStarted(true);
    setIsInitializing(true);
    try {
      const id = await startDesktopAPI();
      const { streamUrl } = await pollForDesktopURL(id);
      setStreamUrl(streamUrl);
      setSandboxId(id);
    } catch (err) {
      console.error("Failed to initialize desktop:", err);
      toast.error("Failed to initialize desktop");
      setHasStarted(false); // allow retry
    } finally {
      setIsInitializing(false);
    }
  };

  // Kill desktop on page close
  useEffect(() => {
    if (!sandboxId) return;

    // Function to kill the desktop - just one method to reduce duplicates
    const killDesktop = () => {
      if (!sandboxId) return;

      // Use sendBeacon which is best supported across browsers
      navigator.sendBeacon(
        `/api/kill-desktop?sandboxId=${encodeURIComponent(sandboxId)}`,
      );
    };

    // Detect iOS / Safari
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    // Choose exactly ONE event handler based on the browser
    if (isIOS || isSafari) {
      // For Safari on iOS, use pagehide which is most reliable
      window.addEventListener("pagehide", killDesktop);

      return () => {
        window.removeEventListener("pagehide", killDesktop);
        // Also kill desktop when component unmounts
        killDesktop();
      };
    } else {
      // For all other browsers, use beforeunload
      window.addEventListener("beforeunload", killDesktop);

      return () => {
        window.removeEventListener("beforeunload", killDesktop);
        // Also kill desktop when component unmounts
        killDesktop();
      };
    }
  }, [sandboxId]);

  return (
    <div className="flex h-dvh relative">
      {/* Starter Overlay */}
      {!hasStarted && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-blue-100/60 to-zinc-200/80 overflow-hidden">
          {/* Animated background shapes */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-300/20 rounded-full blur-2xl animate-pulse-slow" />
          </div>
          <div className="relative bg-white/60 backdrop-blur-xl rounded-2xl shadow-2xl p-12 flex flex-col items-center gap-7 border border-zinc-100/70 max-w-lg w-full mx-4">
            <div className="relative flex items-center justify-center mb-2">
              <FaRocket className="text-blue-600 text-6xl animate-bounce drop-shadow-lg" style={{ filter: 'drop-shadow(0 0 16px #3b82f6)' }} />
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-4 bg-blue-400/30 blur-lg rounded-full animate-pulse" />
            </div>
            <h1 className="text-3xl font-extrabold text-zinc-800 tracking-tight text-center">Welcome to Cyberdesk + AI SDK Computer Use</h1>
            <p className="text-zinc-500 text-base font-medium text-center">Your secure, cloud-powered development environment</p>
            <p className="text-zinc-700 max-w-md text-center text-lg font-normal">
              Click below to start your cloud desktop. You can chat and control the environment after it launches.
            </p>
            <Button
              onClick={handleStartDesktop}
              className="bg-blue-600 hover:bg-blue-700 text-white px-7 py-2.5 rounded-lg text-base font-semibold shadow border border-blue-500/20 transition-colors duration-150 focus:ring-2 focus:ring-blue-400 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={isInitializing}
            >
              {isInitializing ? (
                <span className="flex items-center gap-2"><span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> Starting...</span>
              ) : (
                <span>Start Desktop</span>
              )}
            </Button>
            <div className="pt-4 text-xs text-zinc-400 w-full text-center border-t border-zinc-200/60 mt-2">
              Powered by <a href="https://cyberdesk.io" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-500 hover:underline">Cyberdesk</a>
            </div>
          </div>
        </div>
      )}
      {/* Mobile/tablet banner */}
      <div className="flex items-center justify-center fixed left-1/2 -translate-x-1/2 top-5 shadow-md text-xs mx-auto rounded-lg h-8 w-fit bg-blue-600 text-white px-3 py-2 text-left z-50 xl:hidden">
        <span>Headless mode</span>
      </div>
      {/* Resizable Panels */}
      <div className="w-full hidden xl:block">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Desktop Stream Panel */}
          <ResizablePanel
            defaultSize={70}
            minSize={40}
            className="bg-black relative items-center justify-center"
          >
            {streamUrl ? (
              <>
                <iframe
                  src={streamUrl}
                  className="w-full h-full"
                  style={{
                    transformOrigin: "center",
                    width: "100%",
                    height: "100%",
                  }}
                  allow="autoplay"
                />
                <Button
                  onClick={refreshDesktop}
                  className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white px-3 py-1 rounded text-sm z-10"
                  disabled={isInitializing}
                >
                  {isInitializing ? "Creating desktop..." : "New desktop"}
                </Button>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-white">
                {isInitializing
                  ? "Initializing desktop..."
                  : hasStarted
                  ? "Loading stream..."
                  : "Desktop not started."}
              </div>
            )}
          </ResizablePanel>
          <ResizableHandle withHandle />
          {/* Chat Interface Panel */}
          <ResizablePanel
            defaultSize={30}
            minSize={25}
            className="flex flex-col border-l border-zinc-200"
          >
            <div
              className="flex-1 space-y-6 py-4 overflow-y-auto px-4"
              ref={desktopContainerRef}
            >
              {messages.length === 0 ? <ProjectInfo /> : null}
              {messages.map((message, i) => (
                <PreviewMessage
                  message={message}
                  key={message.id}
                  isLoading={isLoading}
                  status={status}
                  isLatestMessage={i === messages.length - 1}
                />
              ))}
              <div ref={desktopEndRef} className="pb-2" />
            </div>
            {messages.length === 0 && (
              <PromptSuggestions
                disabled={isInitializing || !hasStarted || !streamUrl}
                submitPrompt={(prompt: string) =>
                  append({ role: "user", content: prompt })
                }
              />
            )}
            <div className="bg-white">
              <form onSubmit={handleSubmit} className="p-4">
                <Input
                  handleInputChange={handleInputChange}
                  input={input}
                  isInitializing={isInitializing || !hasStarted || !streamUrl}
                  isLoading={isLoading}
                  status={status}
                  stop={stop}
                />
              </form>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      {/* Mobile View (Chat Only) */}
      <div className="w-full xl:hidden flex flex-col">
        <div
          className="flex-1 space-y-6 py-4 overflow-y-auto px-4"
          ref={mobileContainerRef}
        >
          {messages.length === 0 ? <ProjectInfo /> : null}
          {messages.map((message, i) => (
            <PreviewMessage
              message={message}
              key={message.id}
              isLoading={isLoading}
              status={status}
              isLatestMessage={i === messages.length - 1}
            />
          ))}
          <div ref={mobileEndRef} className="pb-2" />
        </div>
        {messages.length === 0 && (
          <PromptSuggestions
            disabled={isInitializing || !hasStarted || !streamUrl}
            submitPrompt={(prompt: string) =>
              append({ role: "user", content: prompt })
            }
          />
        )}
        <div className="bg-white">
          <form onSubmit={handleSubmit} className="p-4">
            <Input
              handleInputChange={handleInputChange}
              input={input}
              isInitializing={isInitializing || !hasStarted || !streamUrl}
              isLoading={isLoading}
              status={status}
              stop={stop}
            />
          </form>
        </div>
      </div>
    </div>
  );
}
