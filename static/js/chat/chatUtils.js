export function escapeHTML(text) {
    const div = document.createElement('div');
    div.innerText = text;
    return div.innerHTML;
}

export function copiarMensagem(button) {
    const mensagem = button.closest('.message').querySelector('p').textContent;
    navigator.clipboard.writeText(mensagem)
        .then(() => console.log('Mensagem copiada com sucesso'))
        .catch(err => console.error('Erro ao copiar mensagem:', err));
}

export function regenerarResposta(button) {
    const mensagemOriginal = button.closest('.message');
    const mensagemUsuario = mensagemOriginal.previousElementSibling.querySelector('p').textContent;
    const chatContainer = mensagemOriginal.closest('.chat-container');
    const chatInput = document.querySelector('#chat-input');
    const sendBtn = document.querySelector('#send-btn');
    const stopBtn = document.querySelector('#stop-btn');

    // Criar container para versões se não existir
    let versionsContainer = mensagemOriginal.querySelector('.versions-container');
    if (!versionsContainer) {
        versionsContainer = document.createElement('div');
        versionsContainer.className = 'versions-container';
        mensagemOriginal.appendChild(versionsContainer);
    }

    // Salvar conteúdo original
    const conteudoOriginal = mensagemOriginal.querySelector('p').innerHTML;
    
    // Criar botão de alternância
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'version-toggle';
    toggleBtn.textContent = 'Alternar versão';
    toggleBtn.onclick = () => {
        const conteudoAtual = mensagemOriginal.querySelector('p').innerHTML;
        mensagemOriginal.querySelector('p').innerHTML = conteudoAtual === conteudoOriginal ? novoConteudo : conteudoOriginal;
    };
    
    // Enviar nova mensagem
    if (chatInput && sendBtn && stopBtn) {
        chatInput.value = mensagemUsuario;
        const form = chatInput.closest('form');
        if (form) {
            form.dispatchEvent(new Event('submit'));
        }
    }
}