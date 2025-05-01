import { anthropic } from "@ai-sdk/anthropic";
import client from "./client";

const wait = async (seconds: number) => {
  await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
};

export const resolution = { x: 1024, y: 768 };

export const computerTool = (sandboxId: string) =>
  anthropic.tools.computer_20250124({
    displayWidthPx: resolution.x,
    displayHeightPx: resolution.y,
    displayNumber: 1,
    execute: async ({
      action,
      coordinate,
      text,
      duration,
      scroll_amount,
      scroll_direction,
      start_coordinate,
    }) => {
      switch (action) {
        case "screenshot": {
          const response = await client.executeComputerAction({
            path: {
              id: sandboxId,
            },
            body: {
              type: "screenshot",
            },
          });

          const base64Image = response.data?.base64_image;
          if (!base64Image) throw new Error("No image data received");
          return {
            type: "image" as const,
            data: base64Image,
          };
        }
        case "wait": {
          if (!duration) throw new Error("Duration required for wait action");
          const actualDuration = Math.min(duration, 2);
          await wait(actualDuration);
          return {
            type: "text" as const,
            text: `Waited for ${actualDuration} seconds`,
          };
        }
        case "left_click": {
          if (!coordinate)
            throw new Error("Coordinate required for left click action");
          const [x, y] = coordinate;
          await client.executeComputerAction({
            path: {
              id: sandboxId,
            },
            body: {
              type: "move_mouse",
              x,
              y,
            },
          });
        }
        case "double_click": {
          if (!coordinate)
            throw new Error("Coordinate required for double click action");
          const [x, y] = coordinate;
          await client.executeComputerAction({
            path: {
              id: sandboxId,
            },
            body: {
              type: "click_mouse",
              x,
              y,
              num_of_clicks: 2,
            },
          });
          return {
            type: "text" as const,
            text: `Double clicked at ${x}, ${y}`,
          };
        }
        case "right_click": {
          if (!coordinate)
            throw new Error("Coordinate required for right click action");
          const [x, y] = coordinate;
          await client.executeComputerAction({
            path: {
              id: sandboxId,
            },
            body: {
              type: "click_mouse",
              x,
              y,
              num_of_clicks: 1,
              button: "right",
              click_type: "click",
            },
          });
          return {
            type: "text" as const,
            text: `Right clicked at ${x}, ${y}`,
          };
        }
        case "mouse_move": {
          if (!coordinate)
            throw new Error("Coordinate required for mouse move action");
          const [x, y] = coordinate;
          await client.executeComputerAction({
            path: {
              id: sandboxId,
            },
            body: {
              type: "move_mouse",
              x,
              y,
            },
          });
          return {
            type: "text" as const,
            text: `Moved mouse to ${x}, ${y}`,
          };
        }
        case "type": {
          if (!text) throw new Error("Text required for type action");
          await client.executeComputerAction({
            path: {
              id: sandboxId,
            },
            body: {
              type: "type",
              text,
            }
          })
          return { type: "text" as const, text: `Typed: ${text}` };
        }
        case "key": {
          if (!text) throw new Error("Key required for key action");
          await client.executeComputerAction({
            path: {
              id: sandboxId,
            },
            body: {
              type: "press_keys",
              keys: text
            },
          });
          return { type: "text" as const, text: `Pressed key: ${text}` };
        }
        case "scroll": {
          if (!scroll_direction)
            throw new Error("Scroll direction required for scroll action");
          if (!scroll_amount)
            throw new Error("Scroll amount required for scroll action");

          await client.executeComputerAction({
            path: {
              id: sandboxId,
            },
            body: {
              type: "scroll",
              direction: scroll_direction,
              amount: scroll_amount,
            },
          });
          return { type: "text" as const, text: `Scrolled ${text}` };
        }
        case "left_click_drag": {
          if (!start_coordinate || !coordinate)
            throw new Error("Coordinate required for mouse move action");
          const [startX, startY] = start_coordinate;
          const [endX, endY] = coordinate;

          await client.executeComputerAction({
            path: {
              id: sandboxId,
            },
            body: {
              type: "drag_mouse",
              start: { x: startX, y: startY },
              end: { x: endX, y: endY },
            },
          });
          return {
            type: "text" as const,
            text: `Dragged mouse from ${startX}, ${startY} to ${endX}, ${endY}`,
          };
        }
        default:
          throw new Error(`Unsupported action: ${action}`);
      }
    },
    experimental_toToolResultContent(result) {
      if (typeof result === "string") {
        return [{ type: "text", text: result }];
      }
      if (result.type === "image" && result.data) {
        return [
          {
            type: "image",
            data: result.data,
            mimeType: "image/jpeg",
          },
        ];
      }
      if (result.type === "text" && result.text) {
        return [{ type: "text", text: result.text }];
      }
      throw new Error("Invalid result format");
    },
  });

export const bashTool = (sandboxId?: string) =>
  anthropic.tools.bash_20250124({
    execute: async ({ command }) => {
      if (!sandboxId) throw new Error("Sandbox ID required for bash action");
      try {
        const result = await client.executeBashAction({
          path: {
            id: sandboxId,
          },
          body: {
            command,
          },
        });

        if (result.data?.error) {
          throw new Error(result.data.error);
        }
        
        return (
          result.data?.output || "(Command executed successfully with no output)"
        );
      } catch (error) {
        console.error("Bash command failed:", error);
        if (error instanceof Error) {
          return `Error executing command: ${error.message}`;
        } else {
          return `Error executing command: ${String(error)}`;
        }
      }
    },
  });
