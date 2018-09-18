import React, {Component} from 'react';
import logo from './logo.svg';
import './App.css';

import tada from './sound/tada.mp3';
import failure from './sound/failure.mp3';
import sndCheckpoint from './sound/checkpoint.mp3';
import sndCrash from './sound/crash.mp3';
import sndMusic from './sound/music.mp3';

import imgRoad1 from './images/road1-1.png';
import imgRoad2 from './images/road2-1.png';
import imgNocheck from './images/road1.png';


var checkImages = [];
for (var i of [13,15,17,19,21,23,25]) {
    checkImages.push(require(`./images/00${i}.png`));
}

class App extends Component {
    constructor(props) {
        super(props);
        this.state = this.getStartState();
        this.state.gameover = "GAME OVER";

        this.levels = [
            {
                generator: new AddGenerator(1, 20, 1, 20),
                nExercises: 8,
                time: 60
            },
            {
                generator: new AddGenerator(1, 20, 1, 20),
                nExercises: 8,
                time: 40
            },
            {
                generator: new AddGenerator(1, 20, 1, 20),
                nExercises: 8,
                time: 40
            },
            {
                generator: new SubGenerator(2, 20, 1, 20),
                nExercises: 6,
                time: 50
            },
            {
                generator: new SubGenerator(10, 30, 1, 20),
                nExercises: 6,
                time: 50
            },
            {
                generator: new AddGenerator(1, 50, 1, 50),
                nExercises: 8,
                time: 60
            },
            {
                generator: new MulGenerator(0, 10, 0, 10),
                nExercises: 8,
                time: 60
            },
            {
                generator: new MulGenerator(2, 10, 2, 10),
                nExercises: 6,
                time: 50
            },
            {
                generator: new MulGenerator(2, 10, 2, 10),
                nExercises: 6,
                time: 40
            },
            {
                generator: new MulGenerator(2, 10, 10, 20),
                nExercises: 6,
                time: 90
            },
            {
                generator: new MulGenerator(10, 20, 2, 10),
                nExercises: 6,
                time: 90
            },
            {
                generator: new MulGenerator(1, 20, 10, 20),
                nExercises: 6,
                time: 90
            },
        ];
    }

    render() {
        return (
            <div className="App">
                {/*<header className="App-header">*/}
                {/*<img src={logo} className="App-logo" alt="logo" />*/}
                {/*<h1 className="App-title">Welcome to React</h1>*/}
                {/*</header>*/}
                <p className="App-intro">
                    Matek verseny Emilnek
                </p>
                <button id="startBtn" onClick={() => this.start()}>
                    {this.state.gameover.length > 0 ? "Start" : "Stop"}
                </button>
                <hr/>
                <div className="prevExercise">
                    {this.state.prevExercise}
                </div>
                <div className="exercise">
                    {this.state.exercise.problem} =&nbsp;
                    <input ref={(obj) => {this.inputField = obj;}}
                           type="text" id="solution" value={this.state.answer}
                           readOnly={true} onKeyPress={(event) => {this.handleKeyPress(event)}}
                           size="4"
                    />
                </div>
                <audio ref={(obj) => {this.tada = obj;}}>
                    <source src={tada} type="audio/mpeg"></source>
                </audio>
                <audio ref={(obj) => {this.failure = obj;}}>
                    <source src={failure} type="audio/mpeg"></source>
                </audio>
                <audio ref={(obj) => {this.sndCheckpoint = obj;}}>
                    <source src={sndCheckpoint} type="audio/mpeg"></source>
                </audio>
                <audio ref={(obj) => {this.sndCrash = obj;}}>
                    <source src={sndCrash} type="audio/mpeg"></source>
                </audio>
                <audio ref={(obj) => {this.sndMusic = obj;}}>
                    <source src={sndMusic} type="audio/mpeg"></source>
                </audio>
                <br/>
                <div className="image-div">
                    <div class="progress-bar" style={{width:this.state.progress+"%"}}></div>
                </div>
                <div className="image-div">
                    <img className="road-under" src={this.state.landscapeImage} width="640"></img>
                    <img className="road-over" src={this.state.roadImage} width="640" border="1px"></img>
                    <div className="time-left overlay-numbers">
                        {this.state.timeLeft}
                    </div>
                    <div className="score overlay-numbers">
                        {this.state.score}
                    </div>
                    <div className="gameover overlay-numbers" dangerouslySetInnerHTML={{__html: this.state.gameover}}>
                    </div>
                </div>
            </div>
        );
    }

    getStartState() {
        return {
            gameover: "",
            prevExercise: "\u00a0",
            exercise: {},
            answer: "",
            timeLeft: "\u00a0\u00a00",
            score: 0,
            // questionLeft: 0,
            roadImage: imgRoad1,
            landscapeImage: imgNocheck,
            progress: 0
        }
    }

    start() {
        console.log("start() called");
        if (this.state.gameover.length == 0) {
            this.gameover();
            return;
        }
        this.level = 0;
        this.endTime = Date.now();
        this.sndMusic.loop = true;
        this.sndMusic.play();
        this.setState(this.getStartState());
        this.timer = setInterval(()=>{
            var t = Math.ceil((this.endTime - Date.now()) / 1000);
            this.setState({timeLeft: padSpace(t,3)});
            if (t <= 0) {
                this.gameover();
            }
        }, 100);
        this.animationTimer = setInterval(()=>{
            this.setState({
                roadImage: this.state.roadImage==imgRoad1 ? imgRoad2 : imgRoad1,
                // 1% / second
                progress: Math.min((this.endTime - Date.now()) * 1 / 1000, 100)
            });
        }, 200);
        this.processNewLevel(this.levels[this.level]);
        // questionsLeft contains number of questions INCLUDING the actual (what is not the case upon start)
        this.questionsLeft++;
        this.getNextExercise();
        this.inputField.focus();
    }

    gameover() {
        clearInterval(this.timer);
        clearInterval(this.animationTimer);
        this.timer = null;
        this.animationTimer = null;
        this.sndMusic.pause();
        this.sndMusic.currentTime = 0;
        this.setState({
            gameover: `GAME OVER<br>Score: ${this.state.score}`,
        })
        this.sndCrash.play();

    }

    processNewLevel(level) {
        this.endTime += level.time * 1000;
        this.generator = level.generator;
        this.currentLevel = level;
        this.questionsLeft = level.nExercises;
        if (this.level != 0) this.sndCheckpoint.play();
        // this.setState({questionLeft: level.nExercises});
    }

    getNextExercise() {
        this.questionsLeft--;
        if (this.questionsLeft <= 0) {
            if (this.level < this.levels.length-1) this.level++;
            this.processNewLevel(this.levels[this.level]);
        }
        var e = this.generator.generate();
        var checkImg;
        var nImages = checkImages.length;
        if (this.questionsLeft <= nImages) {
            checkImg = checkImages[nImages - this.questionsLeft];
        } else {
            checkImg = imgNocheck;
        }
        this.setState({
            exercise: e,
            answer: "",
            landscapeImage: checkImg
        });
        console.log("Setting state.exercise to", e);
    }

    handleKeyPress(event) {
        if (this.state.gameover) return;
        var expected = String(this.state.exercise.solution);
        var answer = this.state.answer;
        if (event.key.length == 1 && "0123456789".includes(event.key)) {
            answer = answer + event.key;
        }
        if (expected.indexOf(answer) != 0) {
            answer = "";
            this.failure.play();
        } else {
            if (expected.length == answer.length) {
                this.setState({prevExercise: `${this.state.exercise.problem} = ${answer}`})
                answer="";
                this.setState({score: this.state.score + 1});
                this.tada.play();
                this.getNextExercise();
            }
        }
        this.setState({answer: answer});
    }
}

function AddGenerator(min1, max1, min2, max2) {
    this.generate = function () {
        var num1 = randomInt(max1-min1) + min1;
        var num2 = randomInt(max2-min2) + min2;
        return {problem: `${num1} + ${num2}`, solution: num1 + num2}
    }
}

function MulGenerator(min1, max1, min2, max2) {
    this.generate = function () {
        var num1 = randomInt(max1-min1) + min1;
        var num2 = randomInt(max2-min2) + min2;
        return {problem: `${num1} ⋅ ${num2}`, solution: num1 * num2}
    }
}

function SubGenerator(min1, max1, min2, max2) {
    this.generate = function () {
        var num1 = randomInt(max1 - min1) + min1;
        var num2 = randomInt(Math.min(max2, num1) - min2) + min2;
        return {problem: `${num1} - ${num2}`, solution: num1 - num2}
    }
}

function randomInt(max) {
    return Math.floor(Math.random() * max);
}

function pad(num, size) {
    var s = "000000000" + num;
    return s.substr(s.length-size);
}

function padSpace(num, size) {
    var s = "\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0" + num;
    return s.substr(s.length-size);
}

export default App;
