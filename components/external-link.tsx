import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import { type ComponentProps } from 'react';
import { TouchableOpacity, Text, Platform, Linking } from 'react-native';

type Props = ComponentProps<typeof TouchableOpacity> & { href: string; children: React.ReactNode };

export function ExternalLink({ href, children, ...rest }: Props) {
  return (
    <TouchableOpacity
      {...rest}
      onPress={async () => {
        if (Platform.OS !== 'web') {
          await openBrowserAsync(href, {
            presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
          });
        } else {
          Linking.openURL(href).catch(() => {});
        }
      }}
    >
      {typeof children === 'string' ? <Text>{children}</Text> : children}
    </TouchableOpacity>
  );
}
