export type HotelStory = {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  illustration: { src: string; alt: string };
  sections: Array<{ title: string; paragraphs: string[] }>;
};
