class Landing extends React.Component {
    render() {
        return (
            <head>
                <link rel="stylesheet" href="indexcss.css">
                    <meta charset="UTF-8">
                        <title>Kazuhiro</title>
            </head>
        <body>


        <div class="main">

            <a href="https://www.example.co.uk">
                <div id="btn1" class="button">
                    <h1>PLAY</h1>
                </div>
            </a>

            <a href="https://www.example.co.uk">
                <div id="btn2" class="button">
                    <h1>ABOUT</h1>
                </div>
            </a>

            <a href="https://www.example.co.uk">
                <div id="btn3" class="button">
                    <h1>LEGAL</h1>
                </div>
            </a>

        </div>
        <div class="footer">
            <div class="bubbles">
                <div class="bubble"
                     style="--size:4.066032227459916rem; --distance:7.9223967017302614rem; --position:65.48615484521511%; --time:2.8474922506041187s; --delay:-3.1115353607959957s;"></div>
            </div>
            <div class="content">
                <div><a class="image" href="https://codepen.io/z-" target="_blank"
                        style="background-image: url('http://s3-us-west-2.amazonaws.com/s.cdpn.io/199011/happy.svg')"></a>
                    <p>©2019 Adrian Davies, Pascal Schmiedjell, Oliver Seebach </p>
                </div>

            </div>
        </div>
        <svg style="position:fixed; top:100vh">
            <defs>
                <filter id="blob">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur"></feGaussianBlur>
                    <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
                                   result="blob"></feColorMatrix>
                    <feComposite in="SourceGraphic" in2="blob" operator="atop"></feComposite>
                </filter>
            </defs>
        </svg>
        </body>
    );
    }
    }