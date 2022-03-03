import { ComponentStory, ComponentMeta } from '@storybook/react';

import { EmbedMermaid } from './index';

export default {
  title: 'Embedded/Mermaid',
  component: EmbedMermaid,
} as ComponentMeta<typeof EmbedMermaid>;

const Template: ComponentStory<typeof EmbedMermaid> = (args) => (
  <EmbedMermaid {...args} />
);

const classDiagram = `
classDiagram
class GeoPointType {
 <<enumeration>>
  BROWNFIELD
  OGWELL
  CELL_TOWER
  NUCLEAR_REACTOR
  SUPERFUND
}
class GeoPoint {
  -UUID id
  +GeoPointType type
  +GeographyPoint location
  -UUID metadata references metadata(id)
  +Datetime createdAt
}
class GeographyPoint {
  <<interface>>
  +GeoJSON geojson
  +Int srid
  +Float longitude
  +Float latitude
}
class NearbyPoint {
 <<Interface>>
  -UUID id references GeoPoint(id)
  +GeoPointType GeoPoint::type
  +GeographyPoint GeoPoint::location
  +UUID GeoPoint::metadata
  +Float distance
}
class NearbyPoints {
<<Service>>
  +GeoJSON origin
  +Float radiusMi
  +Int first
  +Int last
  +Int offset
  +Cursor before
  +Cursor after
}
class Hotel {
 -UUID id
+String name
-Int objectid 
}
GeoPoint *-- GeoPointType: Composition
GeoPoint *-- GeographyPoint: Composition
GeoPoint "1" <|-- "1" NearbyPoint: Implements
NearbyPoints "1" -- "0..n"NearbyPoint: Contains
Hotel "1" -- "1" GeoPoint: May Contain
`;

export const onDefault = Template.bind({});
onDefault.args = {
  src: classDiagram,
};

export const onGlobalConfig = Template.bind({});
onGlobalConfig.args = {
  src: classDiagram,
  config: {
    theme: 'forest',
  },
};

export const onDiagramConfig = Template.bind({});
onDiagramConfig.args = {
  src: `
  %%{init:{'theme':'dark'}}%%
  graph LR
    q(QEMU) --> qemu-boot-shim --> physboot --> zircon
    `,
};

export const onSyntaxError = Template.bind({});
onSyntaxError.args = {
  src: `
  %%{init:{'theme':'dark'}}%%
  graph LR
    q(QEMU) --> qemu-boot-shim --> physboot -- zircon
    `,
};

export const onPerformanceRisk = Template.bind({});
onPerformanceRisk.args = {
  src: `
  %%{init:{'theme':'dark'}}%%
  graph LR
    a --> b & c --> d & e --> f & g--> h & j--> k & l --> m --> o & p --> q & s --> r & t --> u & v --> w & x --> y & z --> a
    `,
};

export const onError = Template.bind({});
onError.args = {
  error: new Error(),
};

export const onLoading = Template.bind({});
onError.args = {
  isLoading: true,
};

export const onNotFound = Template.bind({});
onNotFound.args = {};
