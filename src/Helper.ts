const getParams: Record<string, string | null> = new Proxy(
    new URLSearchParams(window.location.search),
    {
        get: (searchParams, prop: string) => searchParams.get(prop),
    }
);

class LsWrapperClass {
    getItem = (key: string) => {
        const value = localStorage.getItem(key);
        try {
            return JSON.parse(value ?? "null");
        } catch {
            return value;
        }
    };

    setItem = (key: string, value: unknown) => {
        localStorage.setItem(
            key,
            typeof value === "object" ? JSON.stringify(value) : String(value)
        );
    };

    removeItem = (key: string) => {
        localStorage.removeItem(key);
    };
}

const setRoomUrl = (roomId: string | null) => {
    const url = new URL(window.location.href);
    if (roomId) {
        url.searchParams.set("join", roomId);
    } else {
        url.searchParams.delete("join");
    }
    window.history.replaceState({}, "", url.toString());
};

const getRoomIdFromUrl = () => getParams.join;
const getShareUrl = (roomId: string) => `${window.location.origin}?join=${roomId}`;

const LsWrapper = new LsWrapperClass();

export { LsWrapper, getParams, getRoomIdFromUrl, getShareUrl, setRoomUrl };
