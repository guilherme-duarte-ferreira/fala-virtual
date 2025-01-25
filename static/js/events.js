import { toggleTheme } from './theme.js';
import { toggleSidebar } from './sidebar.js';
import { configureTextarea } from './textarea.js';
import { adicionarMensagem } from './main.js';

export function configureEventListeners() {
    const themeToggle = document.querySelector('.theme-toggle');
    const modelSelect = document.querySelector('.model-select');
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const headerSidebarToggle = document.querySelector('.header-sidebar-toggle');
    const welcomeForm = document.querySelector('#welcome-form');
    const chatForm = document.querySelector('#chat-form');
    const newChatBtn = document.querySelector('.new-chat-btn');

    // Event Listeners
    themeToggle?.addEventListener('click', toggleTheme);
    sidebarToggle?.addEventListener('click', toggleSidebar);
    headerSidebarToggle?.addEventListener('click', toggleSidebar);
    newChatBtn?.addEventListener('click', window.iniciarNovoChat);

    modelSelect?.addEventListener('change', (e) => {
        window.currentModel = e.target.value;
    });

    welcomeForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const input = document.querySelector('#welcome-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        const welcomeScreen = document.querySelector('.welcome-screen');
        const chatContainer = document.querySelector('.chat-container');
        const inputContainer = document.querySelector('.input-container');
        
        welcomeScreen.style.display = 'none';
        chatContainer.style.display = 'block';
        inputContainer.style.display = 'block';
        
        adicionarMensagem(message, 'user');
        
        try {
            const response = await fetch('/send_message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message
                })
            });

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let accumulatedResponse = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            if (data.content) {
                                accumulatedResponse += data.content;
                                const loadingMessage = document.querySelector('.loading');
                                if (loadingMessage) {
                                    loadingMessage.innerHTML = `<p>${accumulatedResponse}</p>`;
                                }
                            } else if (data.conversation_id) {
                                window.conversaAtual = {
                                    id: data.conversation_id,
                                    title: message.slice(0, 30) + (message.length > 30 ? '...' : '')
                                };
                                window.conversas.push(window.conversaAtual);
                                window.atualizarListaConversas();
                            }
                        } catch (e) {
                            console.error('Erro ao processar resposta:', e);
                        }
                    }
                }
            }

            const loadingMessage = document.querySelector('.loading');
            if (loadingMessage) {
                loadingMessage.remove();
            }
            adicionarMensagem(accumulatedResponse, 'assistant');
            
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            adicionarMensagem('Erro ao processar sua mensagem. Por favor, tente novamente.', 'assistant');
        }
        
        input.value = '';
    });

    chatForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const input = document.querySelector('#chat-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        adicionarMensagem(message, 'user');
        
        try {
            const response = await fetch('/send_message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    conversation_id: window.conversaAtual?.id
                })
            });

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let accumulatedResponse = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            if (data.content) {
                                accumulatedResponse += data.content;
                                const loadingMessage = document.querySelector('.loading');
                                if (loadingMessage) {
                                    loadingMessage.innerHTML = `<p>${accumulatedResponse}</p>`;
                                }
                            }
                        } catch (e) {
                            console.error('Erro ao processar resposta:', e);
                        }
                    }
                }
            }

            const loadingMessage = document.querySelector('.loading');
            if (loadingMessage) {
                loadingMessage.remove();
            }
            adicionarMensagem(accumulatedResponse, 'assistant');
            
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            adicionarMensagem('Erro ao processar sua mensagem. Por favor, tente novamente.', 'assistant');
        }
        
        input.value = '';
    });

    // Configurar textareas
    configureTextarea(document.querySelector('#chat-input'));
    configureTextarea(document.querySelector('#welcome-input'));
}