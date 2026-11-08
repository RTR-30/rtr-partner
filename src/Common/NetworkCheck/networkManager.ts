import NetInfo, { NetInfoState } from "@react-native-community/netinfo";

type NetworkListener = (isOffline: boolean) => void;

class NetworkManager {
    private listeners: Set<NetworkListener> = new Set();
    private isOfflineState: boolean = false;
    private hasInitialized: boolean = false;

    constructor() {
        // NetInfo event listener
        NetInfo.addEventListener((state: NetInfoState) => {
            this.handleNetInfoChange(state);
        });

        // Initial fetch
        NetInfo.fetch().then((state: NetInfoState) => {
            this.handleNetInfoChange(state, true);
        });
    }

    private handleNetInfoChange(state: NetInfoState, isInitial = false) {
        // If isConnected is false, definitely offline.
        // If isConnected is true but isInternetReachable is false, offline (no data / captive portal).
        // If isConnected is true and isInternetReachable is null (still determining), do not falsely trigger offline.
        let offline = false;
        if (state.isConnected === false) {
            offline = true;
        } else if (state.isConnected === true && state.isInternetReachable === false) {
            offline = true;
        } else {
            offline = false;
        }

        const wasOffline = this.isOfflineState;
        this.isOfflineState = offline;
        this.hasInitialized = true;

        if (wasOffline !== offline || isInitial) {
            this.notifyListeners(offline);
        }
    }

    public subscribe(listener: NetworkListener): () => void {
        this.listeners.add(listener);
        // Immediately notify subscriber of current state if initialized
        if (this.hasInitialized) {
            listener(this.isOfflineState);
        }
        return () => {
            this.listeners.delete(listener);
        };
    }

    private notifyListeners(isOffline: boolean) {
        this.listeners.forEach((listener) => {
            try {
                listener(isOffline);
            } catch (e) {
                console.error("Error in network listener:", e);
            }
        });
    }

    public async checkConnectivity(): Promise<boolean> {
        try {
            const state = await NetInfo.fetch();
            this.handleNetInfoChange(state);
            return !this.isOfflineState;
        } catch {
            return false;
        }
    }

    public notifyNetworkFailure() {
        // Triggered when an API call fails with network error
        NetInfo.fetch().then((state) => {
            if (state.isConnected === false || state.isInternetReachable === false) {
                this.isOfflineState = true;
                this.notifyListeners(true);
            } else {
                // If NetInfo reports connected, test actual reachability with a ping
                this.verifyInternetAccess();
            }
        });
    }

    private async verifyInternetAccess() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 4000);
            const response = await fetch(`https://clients3.google.com/generate_204?t=${Date.now()}`, {
                method: "HEAD",
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            if (response.ok || response.status === 204) {
                // Internet is working
                if (this.isOfflineState) {
                    this.isOfflineState = false;
                    this.notifyListeners(false);
                }
            } else {
                this.isOfflineState = true;
                this.notifyListeners(true);
            }
        } catch {
            this.isOfflineState = true;
            this.notifyListeners(true);
        }
    }

    public isOffline(): boolean {
        return this.isOfflineState;
    }
}

export const networkManager = new NetworkManager();
