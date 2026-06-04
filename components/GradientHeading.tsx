import { useState } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Text as SvgText,
} from 'react-native-svg';

type Props = {
  children: string | string[];
  fontSize?: number;
  align?: 'left' | 'center';
  weight?: '600' | '700' | '800';
  className?: string;
};

const GOLD = '#D4A017';

export function GradientHeading({
  children,
  fontSize = 28,
  align = 'center',
  weight = '700',
  className,
}: Props) {
  const [width, setWidth] = useState(0);
  const lines = Array.isArray(children)
    ? children
    : String(children).split('\n');
  const lineHeight = fontSize * 1.15;
  const height = Math.ceil(lineHeight * lines.length + 6);
  const x = align === 'center' ? '50%' : 0;
  const textAnchor = align === 'center' ? 'middle' : 'start';

  const onLayout = (e: LayoutChangeEvent) =>
    setWidth(e.nativeEvent.layout.width);

  return (
    <View
      onLayout={onLayout}
      className={className}
      style={{ width: '100%', height }}
    >
      {width > 0 ? (
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id="ayo-gold-white" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0" stopColor={GOLD} stopOpacity={1} />
              <Stop offset="0.1" stopColor={GOLD} stopOpacity={1} />
              <Stop offset="0.4" stopColor="#FFFFFF" stopOpacity={1} />
              <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0.4} />
            </LinearGradient>
          </Defs>
          {lines.map((line, i) => (
            <SvgText
              key={i}
              x={x}
              y={fontSize * 0.95 + i * lineHeight}
              fill="url(#ayo-gold-white)"
              fontSize={fontSize}
              fontWeight={weight}
              textAnchor={textAnchor}
            >
              {line}
            </SvgText>
          ))}
        </Svg>
      ) : null}
    </View>
  );
}
