declare module "nspell" {
  type Dictionary = { aff: string; dic: string };
  interface SpellChecker {
    correct(word: string): boolean;
    suggest(word: string): string[];
    add(word: string, model?: string): SpellChecker;
  }
  export default function nspell(dictionary: Dictionary): SpellChecker;
}
