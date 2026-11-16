# Deploy da API numa VM Linux em Azure

Guia para correr a API e o PostgreSQL numa VM Ubuntu em Azure, com Docker. Serve de alternativa ao Render + Neon e documenta a administração do sistema Linux e da base de dados.

> Não foi executado neste repositório: segue os passos e ajusta nomes, região e palavras-passe.

## 1. Criar a VM

```bash
az group create -n vestigio-rg -l westeurope
az vm create -g vestigio-rg -n vestigio-vm --image Ubuntu2204 --size Standard_B1ms \
  --admin-username azureuser --generate-ssh-keys
az vm open-port -g vestigio-rg -n vestigio-vm --port 80 --priority 900
```

## 2. Preparar o sistema

```bash
ssh azureuser@<ip-da-vm>
sudo apt update && sudo apt -y upgrade
sudo apt -y install docker.io docker-compose-v2 ufw
sudo usermod -aG docker azureuser
sudo ufw allow OpenSSH && sudo ufw allow 80/tcp && sudo ufw --force enable
```

## 3. Correr a stack

```bash
git clone https://github.com/<utilizador>/vestigio.git && cd vestigio
cat > .env <<'ENV'
POSTGRES_PASSWORD=muda-isto
ENV
```

Usa o `docker-compose.yml` do repositório, trocando a palavra-passe por `${POSTGRES_PASSWORD}` e a porta publicada da API para `80:4000`. A base de dados não deve ficar exposta: remove o mapeamento `5432:5432`.

## 4. Manutenção da base de dados

```bash
# cópia de segurança diária (crontab -e)
0 3 * * * docker compose -f ~/vestigio/docker-compose.yml exec -T db pg_dump -U vestigio vestigio | gzip > ~/backups/vestigio-$(date +\%F).sql.gz

# restaurar
gunzip -c backup.sql.gz | docker compose exec -T db psql -U vestigio vestigio
```

## 5. Atualizar a API

A imagem é publicada no GitHub Container Registry pelo workflow `docker.yml`. Para atualizar:

```bash
docker compose pull api && docker compose up -d api
```
