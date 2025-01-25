import './init.js';
import { configureEventListeners } from './events.js';

// Estado global
window.currentModel = 'gemma2:2b';
window.conversas = [];
window.conversaAtual = null;
window.abortController = null;

document.addEventListener('DOMContentLoaded', () => {
    configureEventListeners();
    
    // Carregar conversas do servidor
    fetch('/get_conversation_history')
        .then(response => response.json())
        .then(conversations => {
            window.conversas = conversations;
            atualizarListaConversas();
        })
        .catch(error => console.error('Erro ao carregar conversas:', error));
});

// Funções de gerenciamento de chat
export function iniciarNovoChat() {
    window.conversaAtual = null;
    mostrarTelaInicial();
}

export function carregarConversa(id) {
    fetch(`/get_conversation/${id}`)
        .then(response => response.json())
        .then(conversa => {
            if (conversa) {
                window.conversaAtual = conversa;
                iniciarChat();
                const chatContainer = document.querySelector('.chat-container');
                chatContainer.innerHTML = '';
                conversa.messages.forEach(msg => {
                    adicionarMensagem(msg.content, msg.role);
                });
            }
        })
        .catch(error => console.error('Erro ao carregar conversa:', error));
}

export function atualizarListaConversas() {
    const chatList = document.querySelector('.chat-list');
    chatList.innerHTML = '';
    
    window.conversas.forEach(conversa => {
        const conversaElement = document.createElement('div');
        conversaElement.className = 'chat-item';
        conversaElement.onclick = () => carregarConversa(conversa.id);
        conversaElement.innerHTML = `
            <span>${conversa.title}</span>
            <div class="action-buttons">
                <button class="action-btn" onclick="event.stopPropagation(); renomearConversa('${conversa.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn" onclick="event.stopPropagation(); excluirConversa('${conversa.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        chatList.appendChild(conversaElement);
    });
}

// Expor funções globalmente
window.iniciarNovoChat = iniciarNovoChat;
window.carregarConversa = carregarConversa;
window.atualizarListaConversas = atualizarListaConversas;