import re

with open('js/portal.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. loadDownloads
content = content.replace("fetch('/api/downloads')", "fetch('./downloads.json')")

# 2. login
login_replacement = '''
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
      const user = { name: 'Usuário', email, company: 'Empresa', role: 'engenheiro' };
      portalState.currentUser = user;
      localStorage.setItem('veltha_user', JSON.stringify(user));
      renderPortalState();
      showToast(`Bem-vindo, ${user.name}! Acesso liberado aos arquivos técnicos.`, 'success');
    } catch (err) {
      showToast('Erro ao realizar login. Tente novamente.', 'error');
    }
'''
content = re.sub(r'e\.preventDefault\(\);\s*const email = document\.getElementById\(\'loginEmail\'\)\.value;[\s\S]*?catch \(err\) \{[\s\S]*?\}\s*\}\);', login_replacement + '  });', content)


# 3. register
reg_replacement = '''
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const company = document.getElementById('regCompany').value;
    const email = document.getElementById('regEmail').value;

    try {
      const user = { name: name || 'Novo Usuário', email, company, role: 'engenheiro' };
      portalState.currentUser = user;
      localStorage.setItem('veltha_user', JSON.stringify(user));
      renderPortalState();
      showToast(`Cadastro realizado com sucesso! Bem-vindo, ${user.name}.`, 'success');
    } catch (err) {
      showToast('Erro ao cadastrar. Tente novamente.', 'error');
    }
'''
content = re.sub(r'e\.preventDefault\(\);\s*const name = document\.getElementById\(\'regName\'\)\.value;[\s\S]*?catch \(err\) \{[\s\S]*?\}\s*\}\);', reg_replacement + '  });', content)

with open('js/portal.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('portal.js updated')
