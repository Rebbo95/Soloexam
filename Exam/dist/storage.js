const KEY = "ScuffedArpg-SaveData";
function read() {
    const raw = localStorage.getItem(KEY);
    if (!raw)
        return {};
    try {
        return JSON.parse(raw);
    }
    catch (_a) {
        return {};
    }
}
function write(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
}
export function saveLastClass(classId) {
    const current = read();
    write(Object.assign(Object.assign({}, current), { lastClass: classId }));
}
export function loadSavedData() {
    return read();
}
//# sourceMappingURL=storage.js.map