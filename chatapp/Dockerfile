FROM python:3.11

RUN apt-get update && apt-get install -y postgresql-client

RUN pip install --upgrade pip

RUN pip install django-cors-headers

WORKDIR /chat

COPY requirements.txt .

COPY script.sh .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN chmod +x script.sh

RUN ls -l /chat

EXPOSE 8003

ENTRYPOINT ["./script.sh"]