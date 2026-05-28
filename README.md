# tic-tac-toe curling

## Opsætning

For at opsætte spillet skal man bruge docker.

Naviger til app mappen med kommando ved konsol input

```
cd app/
```

Her er der en docker fil der kan bruges til at bygge projektet. Det gøres ved
følgende kommando.

```
docker build -t tic-tac-toe-curling .
```

Efter kan i start en container med følgende kommando.

```
docker run -d -p 8432:8432 tic-tac-toe-curling
```

Dette starter containeren og siden kan nu nåes på '127.0.0.1:8432'

## Opdatering af siden

For at opdatere siden skal man først pull de nye ændringer fra git.

```
git pull
```

Herefter skal man stoppe den tidligere container. Efter dette kan man gøre det
samme som i opsætningsafsnittet.
