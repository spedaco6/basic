// src/global.d.ts

// Declares that direct CSS module and layout file side-effect imports are valid
declare module "*.css" {
  const content: any;
  export default content;
}
