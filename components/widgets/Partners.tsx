import { Image, Text, View } from 'react-native';

type Partner = {
  id: string;
  name: string;
  uri: string;
};

const PARTNERS: Partner[] = [
  {
    id: 'au',
    name: 'African Union',
    uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Flag_of_the_African_Union.svg/240px-Flag_of_the_African_Union.svg.png',
  },
  {
    id: 'undp',
    name: 'UNDP',
    uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/UNDP_logo.svg/240px-UNDP_logo.svg.png',
  },
  {
    id: 'unicef',
    name: 'UNICEF',
    uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Logo_of_UNICEF.svg/240px-Logo_of_UNICEF.svg.png',
  },
  {
    id: 'who',
    name: 'WHO',
    uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/WHO_logo.svg/240px-WHO_logo.svg.png',
  },
  {
    id: 'worldbank',
    name: 'World Bank',
    uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/The_World_Bank_logo.svg/240px-The_World_Bank_logo.svg.png',
  },
  {
    id: 'ilo',
    name: 'ILO',
    uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/International_Labour_Organization_logo.svg/240px-International_Labour_Organization_logo.svg.png',
  },
  {
    id: 'afdb',
    name: 'AfDB',
    uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/African_Development_Bank_Logo.svg/240px-African_Development_Bank_Logo.svg.png',
  },
  {
    id: 'unesco',
    name: 'UNESCO',
    uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Logo_of_UNESCO_%282017%29.svg/240px-Logo_of_UNESCO_%282017%29.svg.png',
  },
];

export function Partners() {
  return (
    <View className="-mx-4 px-4 py-12">
      <Text className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Our Partners & Data Sources
      </Text>

      <View className="mt-6 flex-row flex-wrap items-center justify-center gap-x-6 gap-y-5">
        {PARTNERS.map((p) => (
          <View key={p.id} className="h-10 w-24 items-center justify-center" style={{ opacity: 0.7 }}>
            <Image
              source={{ uri: p.uri }}
              style={{ width: 90, height: 36 }}
              resizeMode="contain"
              accessibilityLabel={p.name}
            />
          </View>
        ))}
      </View>
    </View>
  );
}
