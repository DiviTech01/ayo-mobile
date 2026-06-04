import { View } from 'react-native';
import Svg, { Defs, Pattern, Path, Rect } from 'react-native-svg';

type Props = {
  size?: number;
  color?: string;
  opacity?: number;
};

export function GridBackground({
  size = 56,
  color = '#3a3a3a',
  opacity = 0.35,
}: Props) {
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <Svg width="100%" height="100%" opacity={opacity}>
        <Defs>
          <Pattern
            id="ayo-grid"
            width={size}
            height={size}
            patternUnits="userSpaceOnUse"
          >
            <Path
              d={`M ${size} 0 L 0 0 0 ${size}`}
              fill="none"
              stroke={color}
              strokeWidth={1}
            />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#ayo-grid)" />
      </Svg>
    </View>
  );
}
