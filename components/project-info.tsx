import { motion } from "motion/react";
import { VercelIcon } from "./icons";
import { ComputerIcon } from "lucide-react";
import Link from "next/link";

export const ProjectInfo = () => {
  return (
    <motion.div className="w-full px-4">
      <div className="rounded-lg border-border border p-6 flex flex-col gap-4 text-center text-base dark:text-zinc-400">
        <p className="flex flex-row justify-center gap-4 items-center text-zinc-900 dark:text-zinc-50">
          <VercelIcon size={16} />
          <span>+</span>
          <ComputerIcon />
        </p>
        <h3 className="text-center text-2xl font-bold">Computer Use Agent</h3>
        <p>
          This demo showcases a Computer Use Agent built with the{" "}
          <StyledLink href="https://sdk.vercel.ai">AI SDK</StyledLink>,{" "}
          <StyledLink href="https://www.anthropic.com/claude/sonnet">
            Anthropic Claude Sonnet 3.7
          </StyledLink>
          , and <StyledLink href="https://cyberdesk.io">Cyberdesk</StyledLink>.
        </p>
        <p>
          {" "}
          Learn more about{" "}
          <Link
            className="text-blue-500 dark:text-blue-400"
            href="https://docs.cyberdesk.io"
            target="_blank"
          >
            Cyberdesk
          </Link>
          .
        </p>
      </div>
    </motion.div>
  );
};

const StyledLink = ({
  children,
  href,
}: {
  children: React.ReactNode;
  href: string;
}) => {
  return (
    <Link
      className="text-blue-500 dark:text-blue-400"
      href={href}
      target="_blank"
    >
      {children}
    </Link>
  );
};

// const Code = ({ text }: { text: string }) => {
//   return <code className="">{text}</code>;
// };
