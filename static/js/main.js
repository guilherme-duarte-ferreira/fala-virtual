import './init.js';
import { 
    iniciarChat,
    mostrarTelaInicial,
    adicionarMensagem
} from './chat/chatUI.js';
import {
    enviarMensagem,
    interromperResposta
} from './chat/chatActions.js';
import {
    carregarConversa,
    atualizarListaConversas,
    copiarMensagem,
    regenerarResposta,
    renomearConversa,
    excluirConversa
} from './chat/chatStorage.js';

// Estado global
window.currentModel = 'gemma2:2b';
window.conversas = [];
window.conversaAtual = null;

// Configurar eventos dos formulários
document.addEventListener('DOMContentLoaded', () => {
    const welcomeForm = document.getElementById('welcome-form');
    const chatForm = document.getElementById('chat-form');
    const chatContainer = document.querySelector('.chat-container');
    const welcomeInput = document.getElementById('welcome-input');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const stopBtn = document.getElementById('stop-btn');

    welcomeForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = welcomeInput.value.trim();
        if (!message) return;

        iniciarChat(
            document.querySelector('.welcome-screen'),
            chatContainer,
            document.querySelector('.input-container')
        );

        adicionarMensagem(chatContainer, message, 'user');
        await enviarMensagem(message, welcomeInput, chatContainer, sendBtn, stopBtn);
    });

    chatForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = chatInput.value.trim();
        if (!message) return;

        adicionarMensagem(chatContainer, message, 'user');
        await enviarMensagem(message, chatInput, chatContainer, sendBtn, stopBtn);
    });
});

// Expor funções globalmente para uso em eventos inline
window.iniciarChat = iniciarChat;
window.mostrarTelaInicial = mostrarTelaInicial;
window.adicionarMensagem = adicionarMensagem;
window.enviarMensagem = enviarMensagem;
window.interromperResposta = interromperResposta;
window.carregarConversa = carregarConversa;
window.atualizarListaConversas = atualizarListaConversas;
window.copiarMensagem = copiarMensagem;
window.regenerarResposta = regenerarResposta;
window.renomearConversa = renomearConversa;
window.excluirConversa = excluirConversa;