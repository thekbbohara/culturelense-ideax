export function formatText(text: string) {
    return text
        .replace(/[-_]+/g, " ")   // replace - and _ with space
        .replace(/\s+/g, " ")     // remove extra spaces
        .trim();
}
