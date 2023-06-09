import { defineStore, storeToRefs }         from 'pinia';
import { io, Socket }                       from 'socket.io-client';
import { mainStore }                        from './main.store';
import debug                                from 'debug'
const log                                   = debug('app:socket.store')

export const socketStore = defineStore('socket', {
  state: () => ({
    _socket: {} as Socket,
  }),

  getters: {
    io: (state) => state._socket,
  },
  
  actions: {
        async init() {

            return new Promise((resolve, reject) => {
                const useMainStore  = mainStore();
                const { user }      = storeToRefs(useMainStore);

                try {
                    const jwt = useMainStore.getCookie({ key: 'token' });
                    this._socket = io(`${process.env.DEV ? 'http://localhost:3000' : ''}`, {
                        withCredentials: true,
                        extraHeaders: {
                            Authorization: `Bearer ${jwt}`
                        }
                    });
                    const socket = this._socket;

                    socket.on('connect', () => {
                        useMainStore._connected = true;
                        log('Socket connected')
                        resolve(true);
                    })

                    socket.on('disconnect', () => {
                        log('Socket disconnected');
                        this._socket = {} as Socket;
                        resolve(true);
                        useMainStore._connected = false;
                    })

                } catch (error) {
                    log('Socket error: ', error);
                    reject(error);
                }
            });
        }
    },
});