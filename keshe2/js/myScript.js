// 选择书籍列表元素和第二个小视图的SVG元素
let bookList = d3.select(".book-list");
let tinyView2 = d3.select(".svg2");

// 存储书籍数据和作者作品频率列表的数组
let books = [];
let authorFreList = [];
// 存储2000年至2020年每年上榜书目数量的数组
let numOfYear = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

// 定义作者作品频率类
class authorFre {
    constructor(name, fre) {
        this.name = name;
        this.fre = fre;
    }
}

// 读取CSV数据
d3.csv("data.csv", d3.autoType)
    .then(function(csvdata){ 
        console.log(csvdata)
        books.push(...csvdata);

        // 遍历书籍数据
        for (let book of books) {
            // 创建列表项，并设置鼠标事件监听器
            let li = bookList.append("li");
            // 显示书籍排名和名称
            li.append("h4").attr("class","rank").text(`${book.rank}`);
            li.append("h4",".name").attr("class","name").text(`${book.name}`);
            // 设置鼠标悬停和点击事件监听器
            let flag = false;
            li.on("mouseenter", function(){
                li.attr("style","color:#ebebd3");
            });
            li.on("mouseleave", function(){
                li.attr("style","color:rgb(137,157,192)");
            });
            li.on("click", function () {
                // 更新当前显示的图书信息
                currentBook = book;
                // 显示图书信息和图片
                showBookDetails();
            });

            // 统计作者作品频率
            for (let son of authorFreList) {
                if (son.name == book.author) {
                    son.fre += 1;
                    flag = true;
                }
            }
            if (!flag) {
                authorFreList.push(new authorFre(book.author, 1));
            }

            // 统计2000年至2020年每年上榜书目数量
            if (book.year >= 2000 && book.year <= 2020) {
                numOfYear[book.year % 2000] += 1;
            }
        }

        // 按照作者作品频率排序
        authorFreList.sort(function(a, b) { 
            return b.fre - a.fre; 
        });

        // 生成随机颜色数组
        let colorSet = ["rgb(25,202,173)","rgb(140,199,181)","rgb(160,238,225)",
        "rgb(190,237,199)","rgb(190,231,233)","rgb(214,213,183)","rgb(209,186,116)",
        "rgb(230,206,172)","rgb(236,173,158)","rgb(244,96,108)","#1abc9c","#2ecc71","#3498db"
        ,"#16a085","#27ae60","#2980b9","#f1c40f","#e67e22","#f39c12","#d35400"
        ,"#58B19F","#9AECDB","#182C61","#D6A2E8","#B33771"];

        // 遍历作者作品频率列表，绘制圆形表示作者及作品数
        for (let author of authorFreList) {
            let authorX = 13.5 + 
                        Math.pow(-1, Math.floor(2 * Math.random() + 1)) * 
                        (11 / Math.pow(author.fre,0.2) * Math.random()) + "rem";
            let authorY = 5.5 + 
                        Math.pow(-1, Math.floor(2 * Math.random() + 1)) * 
                        (5 / author.fre * Math.random()) + "rem";
            let authorR = Math.pow(author.fre, 1.5) / 10  + "rem";
            let authorColor = colorSet[Math.floor(25 * Math.random())];
            let circle = tinyView2.append("circle").attr("cx",`${authorX}`)
                                .attr("cy",`${authorY}`)
                                .attr("style",`r:${authorR}`)
                                .attr("fill",`${authorColor}`);
            // 设置鼠标事件监听器
            if (author.fre >= 1) {
                circle.on("mouseenter", function(){
                    circle.attr("fill","#2C3A47");
                    // 添加作者名字文本
                    d3.select(".svg2").append("text")
                                    .attr("id",`${author.name}`)
                                    .text(`${author.name}`)
                                    .attr("x",`${authorX}`)
                                    .attr("y",`${authorY}`)
                                    .attr("dx", "1.5rem")
                                    .attr("dy", "1.5rem")
                                    .attr("fill","rgb(1,77,103)")
                                    .attr("stroke","black");
                });
                circle.on("mouseleave", function(){
                    circle.attr("fill",`${authorColor}`);
                    // 移除作者名字文本
                    let text = d3.select(`#${author.name}`);
                    text.remove();
                });
                circle.on("click", function() {
                    showBooks(author.name);
                });
            }
        }

        // 绘制柱状图表示2000年至2020年每年上榜书目数量
        let svg = d3.select('.svg1');
        let chart = svg.selectAll('rect')
                    .data(numOfYear)
                    .enter()
                    .append('rect')
                    .attr('x', function(d, i) { return (1 + i) * 1.5 + "rem"; })
                    .attr('y', 0)
                    .attr("stroke", "white")
                    .attr("fill", "rgb(3,54,73)")
                    .attr('width', "1rem")
                    .attr('height', function(d) { return d * 0.55 + "rem"; })
                    .on('click', function() {
                        // 获取点击柱状图的年份并显示对应书籍信息
                        let xValue = parseFloat(d3.select(this).attr('x'));
                        let i = Math.round((xValue - 1.5) / 1.5); // 四舍五入取整
                        let selectedYear = 2000 + i;
                        let booksOfYear = books.filter(book => book.year === selectedYear);
                        let booksStr = booksOfYear.map(book => `${book.name}  评分：${book.mark}\n`).join('');
                        showBooksByYear(selectedYear, booksStr);
                    });

        // 绘制柱状图上的文字表示每年上榜书目数量
        svg.selectAll("text")
            .data(numOfYear)
            .enter()
            .append("text")
            .text(function(d) {return d})
            .attr("y", function(d) {return d * 0.55 - 0.1 + "rem"})
            .attr("x", function(d,i) {return (1 + i) * 1.5 + 0.25 + "rem"})
            .attr("font-family", "sans-serif")
            .attr("font-size", "0.5rem")
            .attr("fill", "white");
        // 绘制柱状图的标题
        svg.append("text")
            .text("2000-2020上榜书目数")
            .attr("y", "12rem")
            .attr("x", "24rem")
            .attr("font-family", "sans-serif")
            .attr("fill", "rgb(3,54,73)")
            .attr("font-weight","1000");

        // 设置柱状图柱子的鼠标事件监听器
        let rects = document.querySelectorAll('.svg1 rect');
        let year = 2000;
        for (let rect of rects) {
            rect.onmouseenter = function(){
                rect.style.fill = "rgb(96,143,159)";
            };
            rect.onmouseleave = function(){
                rect.style.fill = "rgb(3,54,73)";
            };
            year++;
        }
    })
    .catch(function(error) {
        console.log("Error loading CSV:", error);
    });

// 显示作者的书籍信息
function showBooks(authorName) {
    let authorBooks = books.filter(book => book.author === authorName);
    let booksStr = authorBooks.map(book => `${book.name}`).join("\n");
    alert(`作者 ${authorName} 的书籍有：\n${booksStr}`);
}

// 当前显示的图书
let currentBook = null;

// 创建函数显示图书信息和图片
function showBookDetails() {
    // 清空之前的信息
    d3.select(".book-details").remove();

    // 创建一个区域显示图书信息和图片
    let bookDetails = d3.select("body").append("div").attr("class", "book-details")
                        .style("background-color", "white"); // 设置背景色为白色

    // 显示图书信息
    bookDetails.append("h2").text(currentBook.name);
    bookDetails.append("p").text(`作者：${currentBook.author}`);
    bookDetails.append("p").text(`出版社：${currentBook.publisher}`);
    bookDetails.append("p").text(`年份：${currentBook.year}`);
    bookDetails.append("p").text(`价格：${currentBook.price}`);

    // 显示图书图片
    bookDetails.append("img")
        .attr("src", currentBook.img_url)
        .attr("alt", currentBook.name)
        .style("width", "200px");

    // 添加关闭按钮
    bookDetails.append("button")
        .text("关闭")
        .on("click", function() {
            bookDetails.remove(); // 点击关闭按钮移除显示区域
        });
}

// 根据年份显示书籍信息
function showBooksByYear(year, booksStr) {
    // 清空之前的信息
    d3.select(".book-details").remove();

    // 创建一个区域显示图书信息
    let bookDetails = d3.select("body").append("div").attr("class", "book-details")
                        .style("background-color", "white"); // 设置背景色为白色

    // 显示年份和对应的书籍信息
    bookDetails.append("h2").text(`${year}年上榜书目`).join('\n');
    bookDetails.append("p").html(booksStr.replace(/\n/g, "<br>")); // 使用html方法插入换行

    // 添加关闭按钮
    bookDetails.append("button")
        .text("关闭")
        .on("click", function() {
            bookDetails.remove(); // 点击关闭按钮移除显示区域
        });
}
