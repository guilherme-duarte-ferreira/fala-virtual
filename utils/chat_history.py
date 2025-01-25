import json
from datetime import datetime
import os

HISTORY_FILE = 'data/chat_history.json'

def ensure_data_directory():
    os.makedirs('data', exist_ok=True)

def get_conversation_history():
    ensure_data_directory()
    try:
        if os.path.exists(HISTORY_FILE):
            with open(HISTORY_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        return []
    except Exception as e:
        print(f"Erro ao carregar histórico: {str(e)}")
        return []

def get_conversation_by_id(conversation_id):
    conversations = get_conversation_history()
    return next((conv for conv in conversations if str(conv['id']) == str(conversation_id)), None)

def save_conversation(message, response, conversation_id=None):
    ensure_data_directory()
    try:
        conversations = get_conversation_history()
        timestamp = datetime.now().isoformat()
        
        if conversation_id:
            # Atualiza conversa existente
            for conv in conversations:
                if str(conv['id']) == str(conversation_id):
                    conv['messages'].extend([
                        {'role': 'user', 'content': message},
                        {'role': 'assistant', 'content': response}
                    ])
                    conv['timestamp'] = timestamp
                    break
        else:
            # Cria nova conversa
            new_id = str(len(conversations) + 1)
            new_conversation = {
                'id': new_id,
                'timestamp': timestamp,
                'title': message[:30] + ('...' if len(message) > 30 else ''),
                'messages': [
                    {'role': 'user', 'content': message},
                    {'role': 'assistant', 'content': response}
                ]
            }
            conversations.append(new_conversation)
            conversation_id = new_id

        # Salva todas as conversas
        with open(HISTORY_FILE, 'w', encoding='utf-8') as f:
            json.dump(conversations, f, ensure_ascii=False, indent=2)
        
        return conversation_id
    except Exception as e:
        print(f"Erro ao salvar conversa: {str(e)}")
        return None