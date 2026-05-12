import { Fragment } from 'react';
import { Text, View } from 'react-native';

function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <Text key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </Text>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <Text key={i} className="italic text-foreground/90">
          {part.slice(1, -1)}
        </Text>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <Text
          key={i}
          className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground"
        >
          {part.slice(1, -1)}
        </Text>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

export function Markdown({ text }: { text: string }) {
  const lines = text.split('\n');
  const nodes: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];
  let inCode = false;
  let codeLines: string[] = [];
  let key = 0;

  const flushList = () => {
    if (listItems.length === 0) return;
    nodes.push(
      <View key={`ul-${key++}`} className="my-1.5 gap-1">
        {listItems}
      </View>,
    );
    listItems = [];
  };

  for (const rawLine of lines) {
    const line = rawLine;

    if (line.trim().startsWith('```')) {
      if (inCode) {
        nodes.push(
          <View key={`pre-${key++}`} className="my-2 rounded-lg bg-muted p-3">
            <Text className="font-mono text-xs text-foreground">{codeLines.join('\n')}</Text>
          </View>,
        );
        codeLines = [];
        inCode = false;
      } else {
        flushList();
        inCode = true;
      }
      continue;
    }
    if (inCode) {
      codeLines.push(line);
      continue;
    }

    if (line.startsWith('### ')) {
      flushList();
      nodes.push(
        <Text
          key={`h3-${key++}`}
          className="mt-3 mb-1 font-display text-sm font-semibold text-foreground"
        >
          {renderInline(line.slice(4))}
        </Text>,
      );
    } else if (line.startsWith('## ')) {
      flushList();
      nodes.push(
        <Text
          key={`h2-${key++}`}
          className="mt-4 mb-1.5 font-display text-base font-bold text-foreground"
        >
          {renderInline(line.slice(3))}
        </Text>,
      );
    } else if (line.startsWith('# ')) {
      flushList();
      nodes.push(
        <Text
          key={`h1-${key++}`}
          className="mt-4 mb-2 font-display text-lg font-bold text-foreground"
        >
          {renderInline(line.slice(2))}
        </Text>,
      );
    } else if (/^[-*] /.test(line)) {
      listItems.push(
        <View key={`li-${key++}`} className="flex-row pl-2">
          <Text className="text-foreground/90">• </Text>
          <Text className="flex-1 text-sm leading-5 text-foreground/90">
            {renderInline(line.slice(2))}
          </Text>
        </View>,
      );
    } else if (/^\d+\. /.test(line)) {
      const m = line.match(/^(\d+)\. (.*)$/);
      if (m) {
        listItems.push(
          <View key={`oli-${key++}`} className="flex-row pl-2">
            <Text className="text-foreground/90">{m[1]}. </Text>
            <Text className="flex-1 text-sm leading-5 text-foreground/90">
              {renderInline(m[2])}
            </Text>
          </View>,
        );
      }
    } else if (line.trim() === '') {
      flushList();
    } else {
      flushList();
      nodes.push(
        <Text key={`p-${key++}`} className="text-sm leading-6 text-foreground/90">
          {renderInline(line)}
        </Text>,
      );
    }
  }
  flushList();

  return <View className="gap-1">{nodes}</View>;
}
