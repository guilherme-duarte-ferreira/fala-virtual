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
    const welcomeScreen = document.querySelector('.welcome-screen');
    const chatContainer = document.querySelector('.chat-container');
    const inputContainer = document.querySelector('.input-container');
    
    welcomeScreen.style.display = 'flex';
    chatContainer.style.display = 'none';
    inputContainer.style.display = 'none';
    
    document.querySelector('#welcome-input').value = '';
    document.querySelector('#chat-input').value = '';
}

export function carregarConversa(id) {
    fetch(`/get_conversation/${id}`)
        .then(response => response.json())
        .then(conversa => {
            if (conversa) {
                window.conversaAtual = conversa;
                const welcomeScreen = document.querySelector('.welcome-screen');
                const chatContainer = document.querySelector('.chat-container');
                const inputContainer = document.querySelector('.input-container');
                
                welcomeScreen.style.display = 'none';
                chatContainer.style.display = 'block';
                inputContainer.style.display = 'block';
                
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

export function adicionarMensagem(texto, tipo) {
    const chatContainer = document.querySelector('.chat-container');
    const mensagemDiv = document.createElement('div');
    mensagemDiv.className = `message ${tipo}`;
    mensagemDiv.innerHTML = `
        <p>${texto.replace(/\n/g, '<br>')}</p>
        <div class="message-actions">
            <button class="action-btn" onclick="copiarMensagem(this)">
                <i class="fas fa-copy"></i>
            </button>
            ${tipo === 'assistant' ? `
                <button class="action-btn" onclick="regenerarResposta(this)">
                    <i class="fas fa-redo"></i>
                </button>
            ` : ''}
        </div>
    `;
    chatContainer.appendChild(mensagemDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Expor funções globalmente
window.iniciarNovoChat = iniciarNovoChat;
window.carregarConversa = carregarConversa;
window.atualizarListaConversas = atualizarListaConversas;
window.adicionarMensagem = adicionarMensagem;