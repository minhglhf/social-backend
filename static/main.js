const app = new Vue({
    el: '#app',
    data: {
        title: 'Nestjs Websockets Chat',
        name: '',
        text: '',
        messages: [],
        alerts: [],
        socket: { chat: null, alerts: null }
    },
    methods: {
        sendChatMessage() {
            if (this.validateInput()) {
                const message = {
                    sender: this.name,
                    message: this.text
                }
                this.socket.chat.emit('chatToServer', message)
                this.text = ''
            }
        },
        receivedChatMessage(message) {
            this.messages.push(message)
        },
        receivedAlertMessage(msg) {
            this.alerts.push(msg)
        },
        validateInput() {
            return this.name.length > 0 && this.text.length > 0
        }
    },
    created() {
        this.socket.chat = io('http://localhost:8080/chat')
        this.socket.chat.on('chatToClient', (message) => {
            this.receivedChatMessage(message)
        })
        // this.socket.alert = io('http://localhost:8080/alert')
        // this.socket.alert.on('alertToClient', (message) => {
        //     this.receivedAlertMessage(message)
        // })
    }
})