import re

with open('js/app.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. loadCatalogAndDownloads
content = content.replace("fetch('/api/models')", "fetch('./models.json')")
content = content.replace("fetch('/api/downloads')", "fetch('./downloads.json')")

# 2. runSimulation
sim_replacement = '''
  try {
    const targetFlow = parseFloat(state.simulator.flow);
    const targetPress = parseFloat(state.simulator.pressure);
    
    const candidates = state.models.filter(m => {
      const flowOk = targetFlow >= m.minFlow && targetFlow <= m.maxFlow * 1.15;
      const pressOk = targetPress <= m.maxPressure * 1.1;
      return flowOk && pressOk;
    });

    let result = null;
    if (candidates.length > 0) {
      candidates.sort((a, b) => {
        const diffA = Math.abs(a.maxFlow - targetFlow) + (a.powerCv * 100);
        const diffB = Math.abs(b.maxFlow - targetFlow) + (b.powerCv * 100);
        return diffA - diffB;
      });
      result = { recommended: candidates[0], alternatives: candidates.slice(1, 3) };
    } else {
      const largest = state.models[state.models.length - 1];
      result = { recommended: largest, alternatives: [state.models[state.models.length - 2]] };
    }
    
    if (result && result.recommended) {
      state.simulator.currentResult = result.recommended;
      renderSimulatorResult(result.recommended, result.alternatives);
    }
  } catch (err) {
    console.error('Erro na simulação:', err);
  }
}
'''
content = re.sub(r'async function runSimulation\(\) \{[\s\S]*?catch \(err\) \{[\s\S]*?\}\s*\}', 'async function runSimulation() {' + sim_replacement, content)

# 3. auth
auth_replacement = '''
    const isRegister = el.authForm.getAttribute('data-mode') === 'register';
    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;
    const name = document.getElementById('authName')?.value;
    const company = document.getElementById('authCompany')?.value;

    try {
      if (isRegister) {
        const user = { name: name || 'Novo Usuário', company, email, role: 'cliente' };
        state.currentUser = user;
        localStorage.setItem('veltha_user', JSON.stringify(user));
        closeAuthModal();
        updateAuthUI();
        renderPortalDownloads();
        showToast(`Bem-vindo, ${user.name}! Arquivos CAD e laudos liberados.`, 'success');
      } else {
        const user = { name: 'Usuário', email, role: 'cliente' };
        state.currentUser = user;
        localStorage.setItem('veltha_user', JSON.stringify(user));
        closeAuthModal();
        updateAuthUI();
        renderPortalDownloads();
        showToast(`Bem-vindo de volta! Arquivos CAD e laudos liberados.`, 'success');
      }
    } catch (err) {
      showToast('Erro na autenticação. Tente novamente.', 'error');
    }
  });
'''
content = re.sub(r'const isRegister = el\.authForm\.getAttribute[\s\S]*?catch \(err\) \{[\s\S]*?\}\s*\}\);', auth_replacement, content)

# 4. chatbot
chat_replacement = '''
    const text = el.chatbotInput.value.trim();
    if (!text) return;

    appendChatMessage(text, 'user');
    el.chatbotInput.value = '';

    const typingId = appendChatMessage('Digitando resposta técnica...', 'bot typing');

    setTimeout(() => {
      removeChatMessage(typingId);
      const lower = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      let reply = '';
      let suggestedAction = null;

      if (lower.includes('vtd') || lower.includes('tecnologia') || lower.includes('multiventuri')) {
        reply = `A tecnologia exclusiva patenteada pela Veltha é a **Centrifugação Líquida Multiventuri®**...`;
        suggestedAction = { label: '🎛️ Testar Simulador', target: 'simulator' };
      } else {
        reply = `Entendi. Para informações mais detalhadas sobre o seu caso, consulte nosso simulador ou entre em contato!`;
        suggestedAction = { label: 'Ir para o Simulador', target: 'simulator' };
      }
      appendChatMessage(reply, 'bot', suggestedAction);
    }, 1000);
  };
'''
content = re.sub(r'const text = el\.chatbotInput\.value\.trim\(\);[\s\S]*?catch \(err\) \{[\s\S]*?\}\s*\};', chat_replacement, content)

# 5. quotes
quote_replacement = '''
    e.preventDefault();
    showToast('✅ Proposta enviada com sucesso! Nossa engenharia entrará em contato.', 'success');
    el.quoteForm.reset();
  });
'''
content = re.sub(r'e\.preventDefault\(\);\s*const formData = \{[\s\S]*?catch \(err\) \{[\s\S]*?\}\s*\}\);', quote_replacement, content)


with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('app.js updated')
