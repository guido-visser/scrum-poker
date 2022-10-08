const getParams: any = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop: any) => searchParams.get(prop),
});

class lsWrapper {
    getItem = (key: string) => {
        const value = localStorage.getItem(key);
        try {
            return JSON.parse(value);
        } catch (e) {
            return value;
        }
    };
    setItem = (key: string, value: any) => {
        localStorage.setItem(
            key,
            typeof value === "object" ? JSON.stringify(value) : value
        );
    };
}

const LsWrapper = new lsWrapper();

export { LsWrapper, getParams };
