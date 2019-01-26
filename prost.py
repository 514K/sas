import requests
url = 'http://oreluniver.ru/schedule/'
requests.get(url)
req = requests.get(url).text
print(req[:600]) #отображение 600 символов
