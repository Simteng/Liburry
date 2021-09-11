export enum MainDisplayAreaMode {
    HOME = "HOME",
    SEARCH = "SEARCH",
    ABOUT = "ABOUT",
    CONTACT = "CONTACT",
    SETTINGS = "SETTINGS",
}

export interface RawKnownDisplayTypeEntry {
    dictionary?: RawDictionaryFieldDisplayType,
    fake_mtg?: FakeMTGDisplayType,
}

export type DisplayType = keyof RawKnownDisplayTypeEntry;
export type DataType = RawKnownDisplayTypeEntry[DisplayType];

export type FakeMTGDisplayType = "fake_mtg" | "mtg_fake";

// NOTE: this are still somewhat specific to taigi.us - can they be abstracted per-app?
// NOTE: for perf, this can/could be an enum (doubtful that it will matter for a long, long time)
export type RawDictionaryFieldDisplayType =
    "base_phrase" |
    "channel_name" |
    "class" |
    "contributor" |
    "date_YYYY.MM.DD" |
    "dbname" |
    "definition" |
    "example" |
    "example_phrase" |
    "explanation" |
    "id" |
    "input" |
    "input_other" |
    "link" |
    "matched_example" |
    "measure_word" |
    "normalized" |
    "normalized_other" |
    "opposite" |
    "page_number" |
    "pos_classification" |
    "see_also" |
    "synonym" |
    "type" |
    "UNKNOWN" |
    "vocab" |
    "vocab_other";
