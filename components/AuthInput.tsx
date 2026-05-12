import { forwardRef, useState } from 'react';
import {
  Pressable,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/lib/theme-colors';
import { tapLight } from '@/lib/haptics';

type Props = Omit<TextInputProps, 'placeholderTextColor'> & {
  label: string;
  leftIcon?: React.ComponentProps<typeof Ionicons>['name'];
  rightAction?: {
    label?: string;
    onPress: () => void;
  };
  /** When true, renders a password eye toggle on the right and forces secureTextEntry off when toggled. */
  password?: boolean;
};

export const AuthInput = forwardRef<TextInput, Props>(function AuthInput(
  { label, leftIcon, rightAction, password = false, ...inputProps },
  ref,
) {
  const colors = useThemeColors();
  const [show, setShow] = useState(false);

  const secureTextEntry = password ? !show : inputProps.secureTextEntry;
  const paddingLeft = leftIcon ? 'pl-11' : 'pl-4';
  const paddingRight = password || rightAction ? 'pr-11' : 'pr-4';

  return (
    <View>
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-medium text-foreground">{label}</Text>
        {rightAction ? (
          <Pressable onPress={rightAction.onPress} hitSlop={6}>
            <Text className="text-xs font-medium text-primary">
              {rightAction.label ?? 'Action'}
            </Text>
          </Pressable>
        ) : null}
      </View>

      <View className="mt-1.5">
        {leftIcon ? (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: 14,
              top: 0,
              bottom: 0,
              justifyContent: 'center',
            }}
          >
            <Ionicons name={leftIcon} size={16} color={colors.mutedForeground} />
          </View>
        ) : null}

        <TextInput
          ref={ref}
          {...inputProps}
          secureTextEntry={secureTextEntry}
          placeholderTextColor={colors.mutedForeground}
          className={`rounded-xl border border-border bg-muted ${paddingLeft} ${paddingRight} py-3.5 text-base text-foreground`}
        />

        {password ? (
          <Pressable
            onPress={() => {
              tapLight();
              setShow((s) => !s);
            }}
            hitSlop={6}
            style={{
              position: 'absolute',
              right: 8,
              top: 0,
              bottom: 0,
              justifyContent: 'center',
              paddingHorizontal: 6,
            }}
          >
            <Ionicons
              name={show ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={colors.mutedForeground}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
});
