"use strict"
//贪吃蛇
class Game {
    
    init() {
        let table = document.createElement("table")
        table.style.borderCollapse = "collapse"
        table.style.border = "1px solid black"
        table.style.margin = "0 auto"
        table.style.width = this.w * 31 + 1 + "px"
        table.style.height = this.h * 31 + 1 + "px"
        this.container.appendChild(table)
        for (let i = 0; i < this.h; i++) {
            let tr = document.createElement("tr")
            table.appendChild(tr)
            for (let j = 0; j < this.w; j++) {
                let td = document.createElement("td")
                td.style.border = "1px solid black"
                td.style.width = "30px"
                td.style.height = "30px"
                tr.appendChild(td)
            }
        }
        this.container.style.textAlign = "center"
        let startMsg = document.createElement("h1")
        startMsg.innerText = "按任意键开始游戏"
        this.container.appendChild(startMsg)
        document.onkeydown = (e) => {
            this.container.removeChild(startMsg)
            document.onkeydown = null
            this.start()
        }
    }
    start() {

        let table = this.container.querySelector("table")
        let td = table.querySelectorAll("td")
        let snake = { head: { x: 5, y: 1 }, body: [{ x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 }], direction: "right" }
        let food = []
        let score = 0
        this.snake = snake
        this.food = food
        this.score = score
        this.td = td
        this.table = table
        let scoreMsg = document.createElement("h2")
        scoreMsg.innerText = "得分：" + score
        scoreMsg.style.textAlign = "center"
        scoreMsg.id = "scoreMsg"
        this.container.appendChild(scoreMsg)
        document.onkeydown = (e) => {
            let key = e.key
            console.log(key);
            if (key == "ArrowLeft" && snake.direction != "right") {
                snake.direction = "left"
            }
            if (key == "ArrowRight" && snake.direction != "left") {
                snake.direction = "right"
            }
            if (key == "ArrowUp" && snake.direction != "down") {
                snake.direction = "up"
            }
            if (key == "ArrowDown" && snake.direction != "up") {
                snake.direction = "down"
            }

        }
        let spawnNewFood = () => {
            let newFood = { x: Math.floor(Math.random() * this.w), y: Math.floor(Math.random() * this.h) }
            let badBlock = JSON.stringify(this.snake.body).includes(JSON.stringify(newFood)) || JSON.stringify(food).includes(JSON.stringify(newFood)) || JSON.stringify(newFood).includes(JSON.stringify(snake.head))
            while (badBlock) {
                newFood = { x: Math.floor(Math.random() * this.w), y: Math.floor(Math.random() * this.h) }
                badBlock = JSON.stringify(this.snake.body).includes(JSON.stringify(newFood)) || JSON.stringify(food).includes(JSON.stringify(newFood)) || JSON.stringify(newFood).includes(JSON.stringify(snake.head))
            }
            this.food.push(newFood)
        }

        spawnNewFood()
        let gameInterval = setInterval(() => {

            snake.body.push({ x: snake.head.x, y: snake.head.y })
            switch (snake.direction) {
                case "right":
                    snake.head.x++
                    break;
                case "left":
                    snake.head.x--
                    break;
                case "up":
                    snake.head.y--
                    break;
                case "down":
                    snake.head.y++
                    break;
            }
            if (snake.head.x < 0 || snake.head.x > this.w - 1 || snake.head.y < 0 || snake.head.y > this.h - 1) {
                uploadScore(this.score)
                clearInterval(gameInterval)
                return
            } snake.body.forEach(item => {
                if (item.x == snake.head.x && item.y == snake.head.y) {
                    uploadScore(this.score)
                    clearInterval(gameInterval)
                    return
                }
            }
            )
            let isGetFood = false
            food.forEach(item => {
                if (item.x == snake.head.x && item.y == snake.head.y) {
                    game.score++
                    scoreMsg.innerText = "得分：" + game.score
                    food.splice(food.indexOf(item), 1)
                    isGetFood = true
                    spawnNewFood()
                }
            })
            if (!isGetFood) {
                snake.body.shift()
            }
            td.forEach(item => {
                item.style.backgroundColor = "white"
            }
            )
            snake.body.forEach(item => {
                td[item.y * this.w + item.x].style.backgroundColor = "black"
            }
            )
            td[snake.head.y * this.w + snake.head.x].style.backgroundColor = "red"
            food.forEach(item => {
                td[item.y * this.w + item.x].style.backgroundColor = "green"
            }
            )
        }, 200);
    }
}
