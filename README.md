# crime-s-visualization-RS

# Instruções

versão: python 2.7

Carregue o arquivo /static/indicativos.csv no mongoDB da seguinte forma:

```{r, engine='bash', count_lines}

    $ mongoimport -d indicativos -c crimes --type csv --file indicativos.csv —headerline   
```

Verifique se deu certo:

```{r, engine='bash', count_lines}

    $ mongo
    $ use indicativos
    $ show collections
    $ db.crimes.findOne()
    
```
