# crime-s-visualization-RS

# Instruções

versão: python 2.7

Carregue o arquivo /static/indicativos.csv no mongoDB da seguinte forma:

```{r, engine='bash', count_lines}

    $  mongoimport -d indicativos -c crimes --type csv -file "indicativo.csv" -headerline

```

Verifique se deu certo:

```{r, engine='bash', count_lines}

    $ mongo
    $ use indicativos
    $ show collections
    $ db.crimes.findOne()

```
### libraries utilizadas

- crossfilter.js é usado para agrupar, filtrar e agregar grandes conjuntos de dados
- d3.js para controlar os dados e construir os gráficos
- dc.js gerencia o crossfilter.js e d3.js facilitando a criação de visualizações interativas

Blog usado como referência: <http://adilmoujahid.com/posts/2015/01/interactive-data-visualization-d3-dc-python-mongodb/>
