import { Text, View } from 'react-native';

type Props = {
  showWordmark?: boolean;
  size?: 'sm' | 'md' | 'lg';
};

export function BrandLogo({ showWordmark = true, size = 'md' }: Props) {
  const chipSize = size === 'sm' ? 'h-7 w-7' : size === 'lg' ? 'h-14 w-14' : 'h-9 w-9';
  const chipText = size === 'sm' ? 'text-[10px]' : size === 'lg' ? 'text-lg' : 'text-[11px]';
  const wordmarkText = size === 'lg' ? 'text-xl' : 'text-base';

  return (
    <View className="flex-row items-center gap-2.5">
      <View
        className={`${chipSize} items-center justify-center rounded-lg bg-primary`}
      >
        <Text
          className={`font-display ${chipText} font-extrabold tracking-wider text-primary-foreground`}
        >
          AYD
        </Text>
      </View>
      {showWordmark ? (
        <Text className={`font-display ${wordmarkText} font-bold text-foreground`}>
          African Youth Observatory
        </Text>
      ) : null}
    </View>
  );
}
