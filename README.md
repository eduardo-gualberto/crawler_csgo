# crawler_csgo
Web Crawler para extrair e estruturar dados estatísticos de um cassino online

A aplicação é feita em JavaScript, com a runtime do Node, feita com intenção de estudo.
1. Bibliotecas terceiras utilizadas
  * Puppeteer, biblioteca Node para navegação no browser Chrome ou Chromium headless sob o protocolo das ferramentas de desenvolvimento do Chrome https://github.com/puppeteer/puppeteer
  * MySQL para Node, biblioteca que facilita comunicação do programa com um servidor de banco de dados em MySQL https://github.com/mysqljs/mysql

2. Por que Puppeteer e MySQL?
  * Puppeteer pois permite que elementos inseridos de forma dinâmica no documento da página possam ser capturados, além de possuir um sistema de "event listeners" que esperam por seletores CSS executar a callback.
  * MySQL pois possui grande simplicidade de uso, mas grande parte da motivação foi para aprender. Talvez nesse caso um banco NoSQL fosse mais conveniente, pois não há relacionamento nas tabelas.

# Feito por Eduardo dos Santos Gualberto
