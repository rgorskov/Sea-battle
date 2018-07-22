
;(function(){
	window.onload = initialize;

	var player1, player2;	// объекты игроков
	var turnInfo;			// элемент p#turn с инфой кто ходит
	var delay;				// задержка для компа

	function initialize(){
		showInputForm();
		turnInfo = document.getElementById('turn');

		document.getElementById('linkDemo').addEventListener('click', linkDemoHandler);
		document.getElementById('enterForm').onsubmit = enterFormSubmitHandler;
		document.getElementById('linkHelp').addEventListener('click', linkHelpHandler)
		document.getElementById('helpForm').onsubmit = helpFormSubmitHandler;
		document.getElementById('winForm').onsubmit = winFormSubmitHabdler;
	}


	function showInputForm(){
		showForm(document.getElementById('enterForm'));
	}

	// запустить демо
	function linkDemoHandler(e){
		hideForm(document.getElementById('enterForm'));
		document.getElementById('linkDemo').removeEventListener('click', linkDemoHandler);

		document.getElementById('firstPlName').innerHTML = 'Игрок 1';
		document.getElementById('secondPlName').innerHTML = 'Игрок 2';

		//два игрока с авто ходами: первый true - авто ходы, второй true - отображать корабли
		player1 = new Player('Игрок 1', document.getElementById('firstField'), true, true, 'firstPlInfo');
		player2 = new Player('Игрок 2', document.getElementById('secondField'), true, true, 'secondPlInfo');
		player1.opponent = player2;
		player2.opponent = player1;

		delay = 350;

		player1.turn();
	}

	// нажимает играть
	function enterFormSubmitHandler(e){
		hideForm(document.getElementById('enterForm'));
		e.preventDefault();
		var userName = document.forms['enter'].elements['userName'].value;
		var showedName = (userName) ? userName : "Игрок";
		document.getElementById('firstPlName').innerHTML = showedName;

		//
		player1 = new Player(showedName, document.getElementById('firstField'), false, true, 'firstPlInfo');
		player2 = new Player('Компьютер', document.getElementById('secondField'), true, false, 'secondPlInfo');
		player1.opponent = player2;
		player2.opponent = player1;
		delay = 1000;

		player1.turn();	// первым ходит игрок
	}

	function linkHelpHandler(){
		showForm(document.getElementById('helpForm'));
	}

	function helpFormSubmitHandler(e){
		hideForm(document.getElementById('helpForm'));
		e.preventDefault();
	}

	function winFormSubmitHabdler(e){
		hideForm(document.getElementById('winForm'));
		e.preventDefault();
	}

	function hideForm(form){
		//document.getElementById('enterForm').style.display = 'none';
		form.style.display = 'none';
		document.getElementById('main').style.opacity = '1';
	}

	function showForm(form){
		//document.getElementById('enterForm').style.display = 'block';
		form.style.display = 'block';
		document.getElementById('main').style.opacity = '0.1';
	}

	//Конструктор объекта флота
	function Navy(){
		/*массив объектов кораблей (колво палуб-numDecks, массив Ship-ships) */
		this.units = [];

		// инициализация units
		for(var i=0; i<4; i++){
			this.units[i] = {
				'numDecks':0,
				'ships':[]
			};

			this.units[i].numDecks = i+1;
			for (var j=0; j<4-i;j++){
				this.units[i].ships[j] = new Ship(i+1);
			}
		}

		// переворачивает units чтобы начать размещать с 4х палубного
		this.units.reverse();
		/**/

		// количество живых кораблей
		Object.defineProperty(this, 'countAlive', {
			get: function(){
				var count = 0;
				for (var i = 0; i < this.units.length; i++) {
					for(var j = 0; j < this.units[i].ships.length; j++){
						if(this.units[i].ships[j].isAlive)
							count++;
					}
				}
				return count;
			}
		});
		/**/

		// количество живых кораблей по палубам
		this.countAliveByDeck = function(n){
			var count = 0;
			for (var i = 0; i < this.units.length; i++) {
				for(var j = 0; j < this.units[i].ships.length; j++){
					if(this.units[i].numDecks == n && this.units[i].ships[j].isAlive)
						count++;
				}
			}
			return count;
		}

		//массив расстановок кораблей
		this.placement = ((function(){

			var res = nullArrInit(),	//здесь будет результат для placement
				count = 0,			//счетчик кораблей
				x = 0, 				// координата х
				y=0, 				// координата y
				v=0, 				// расположение по вертикали (0 - горизонталь, 1 вертикаль)
				n=0;				// колво палуб



			for(var i = 0; i<this.units.length; i++){
				for(var j=0; j<this.units[i].ships.length; j++){
					n = this.units[i].ships[j].numDecks;
					do{
						v = randInt(0, 1);
						x = randInt(0, 9 - (n-1));
						y = randInt(0, 9 - (n-1));
					}while(!isEmptyPlace(x, y, v, n, res));	//подбират x y v пока для них не найдется свободное место
					putShip(x, y, v, n, res, this.units[i].ships[j], count); // занять координаты
					count++;
				}
			}
			return res;
		}).bind(this))();


	}

	/*случ число от min до max*/
	function randInt(min, max) {
	    var rand = min + Math.random() * (max + 1 - min);
	    rand = Math.floor(rand);
	    return rand;
	}


	// массив nullов 10*10
	function nullArrInit(){
		var arr = new Array();
		for(var i=0; i<10; i++){
			arr[i] = new Array();
			for(var j=0; j<10; j++){
				arr[i][j] = null;
			}
		}
		return arr;
	}

	/*проверка свободно ли место*/
	function isEmptyPlace(x, y, v, n, arr){
		if(v){
			for(var i=0; i<n; i++)
				if(arr[y+i][x]) return false;
		}else{
			for(var i=0; i<n; i++)
				if(arr[y][x+i]) return false;
		}
		return true;
	}
	/*установка корабля в клетку массива*/
	function putShip(x, y, v, n, arr, s, c){
		if(v){
			for(var i=0; i<n; i++){
				occupyCell(x, y+i, arr, 'o');
				arr[y+i][x] = {'shipObj': s, 'deckID': s.decks[i], 'shipNum':c};
			}
		}else{
			for(var i=0; i<n; i++){
				occupyCell(x+i, y, arr, 'o');
				arr[y][x+i] = {'shipObj': s, 'deckID': s.decks[i], 'shipNum':c};

			}
		}
		//return arr;
	}
	/*занять все клетки вокруг*/
	function occupyCell(x, y, arr, fill){
		for(var i = (y-1); i<=(y+1); i++){
			if(i>=0 && i<=9)
				for(var j = (x-1); j<=(x+1); j++){
					if(j>=0 && j<=9 && !arr[i][j])
						arr[i][j] = fill;
				}
		}
	}

	// конструктор объекта корабля
	function Ship(d){
		this.numDecks = d;	// количество палуб
		this.decks = new Array(this.numDecks);	// массив с индексами палуб, если -1 то подбита
		this.numLiveDecks = d;	// количество целых палуб
		this.isAlive = true;	// корабль жив

		for(var i=0; i<this.numDecks; i++){
			this.decks[i] = i;
		}

		// метод  события выстрела
		this.hit = function(deckID){
			if(this.isAlive && this.decks[deckID] != 0){
				this.decks[deckID] = -1;
				this.numLiveDecks -=1;

				if(this.numLiveDecks == 0)
					this.isAlive = false;
			}
		}
	}

	/*конструктор объекта отображающейся в поле ячейки*/
	function Cell(){
		this.divCell = document.createElement('div');
		this.divCell.setAttribute('class', 'cell');
		//this.isEmpty = true;
		this.divShip =  null;//document.createElement('div');

		this.ship = function(){
									setDivShip.call(this, 'ship');}	//отображение зеленого круга
		this.injured = function(){
									setDivShip.call(this, 'ship injured');}	// отображение оранжевого круга
		this.dead = function(){
									setDivShip.call(this, 'ship dead');}	// отображение красного круга
		this.miss = function(){
									setDivShip.call(this, 'ship miss');}	// промах
	}

	// устанавливает соответствующий класс для Cell
	function setDivShip(cl){
		if(!this.divShip)
		{
			this.divShip = document.createElement('div');
			this.divCell.appendChild(this.divShip);
		}
		this.divShip.setAttribute('class', cl);
		//this.isEmpty = false;
	}

	// конструктор объекта игрока
	function Player(n, pf, auto, s, info){
		this.name = n;			// имя
		this.plField = pf;		// элемент с полем игрока
		this.auto = auto;		// флаг компа, true - авто ходы
		this.showShips = s;		// отображение зеленых кораблей
		this.fleetInfo = info;	// элемемнт div c инфой в боковой части

		this.opponent = null;	// ссылка на объект противника

		this.navy = new Navy();

		this.hitMap = nullArrInit();	// массив карты выстрелов: true - в ячейку был выыстред/нельзя стрелять

		//
		this.win = function(){
			showForm(document.getElementById('winForm'));
			var msg = this.name + ' одержал победу!';
			document.getElementById('winner').innerHTML = msg;
			/*document.getElementsByClassName('formInner')[0].innerHTML = msg;
			document.getElementById('enterForm').style.padding = '40px 0';
			document.getElementById('enterForm').style.height = '80px';*/
		};

		// массив с объектами Cell
		this.cells = ((function(){
			var arr = nullArrInit();	// массив 10*10 из нулов
			for(var i=0; i<10; i++){
				for(var j=0; j<10; j++){
					arr[i][j] = new Cell();
					var x = j, y=i;
					var id = createCellId(x, y, this.name);	// idшник для каждого Cella
					arr[i][j].divCell.setAttribute('id', id);
				}
			}
			return arr;
		}).bind(this))();

		// заполнение поля ячейками
		for(var i=0; i<10; i++){
			for(var j=0; j<10; j++){
				if(this.showShips && isObject(this.navy.placement[i][j]))
					this.cells[i][j].ship();
				this.plField.appendChild(this.cells[i][j].divCell);
			}
		}

		// свойство проиграл - непроиграл
		Object.defineProperty(this, 'isLose', {
			get: function(){
				if(this.navy.countAlive==0)
					return true;
				return false;
			}
		});

		// с боку кол-во кораблей
		for(var i=0; i<this.navy.units.length; i++){
			setFleetInfo(this, this.navy.units[i].numDecks);
		}

		// запускает компа или ход игрока
		this.turn = function(){
			if(this.auto){
				compTurn(this);
			}
			else{
				userTurn(this);
			}
		}
	}

	// проверка на объект
	function isObject(o){
		if(typeof o == 'object' && o != null)
			return true;
		return false;
	}

	// ход игрока - вешает обработчик на нажатие на каждую ячейку на поле противника
	function userTurn(pl){
		showTurnInfo(pl);
		for(var i=0; i<10; i++){
			for(var j=0; j<10; j++){
				var x = j, y=i;
				var id = createCellId(x, y, pl.opponent.name);
				document.getElementById(id).addEventListener('click', userTurnHandler);
			}
		}
	}

	// обработчик нажатия
	function userTurnHandler(e){
		var pl = player1;			// *************косячок*****************

		// удаление обработчика
		for(var i=0; i<10; i++){
			for(var j=0; j<10; j++){
				//var x = j, y=i;
				var id = createCellId(j, i, pl.opponent.name);
				document.getElementById(id).removeEventListener('click', userTurnHandler);
			}
		}

		// правильный idшник - не круга а ячейки
		var targetId = e.target.id;
		if(!targetId)
			targetId = e.target.parentNode.id

		var x=numFromCellId(targetId)[0],
				y=numFromCellId(targetId)[1];

		// attack возвращает true при попадании или повторном нажатии в ячейку
		if(attack(pl, x, y)){
			userTurn(pl);
			return;
		}

		// если противник не проиграл - запустить его turn
		if(!pl.opponent.isLose)
			pl.opponent.turn();

	}

	// ход компа
	function compTurn(pl){
		showTurnInfo(pl);
		setTimeout(function(){

			var arrXY = makeXY(pl);
			var x = arrXY[0];
			var y = arrXY[1];

			if(attack(pl, x, y)){
				compTurn(pl);
				return;
			}

			if(!pl.opponent.isLose)
				pl.opponent.turn();
		}, delay);

	}

	// конструктор объекта с попаданием - записывается как элемент массива hitMap игрока
	function Moves(x, y, map){
		this.x = x;		// координаты
		this.y = y;		//
		this.hitMap = map;	// массив выстрелов

		// возможные ходы относительно текущего (верх-низ-лево-право)
		// плохой
		this.possibleMoves = function(){
			var res = new Array(4);

			for(var i=0; i<4; i++){
				res[i]=null;
			}

			// если не true то туда можно сходить
			if((this.x-1)>=0 && this.hitMap[this.y][this.x-1]!=true)
				res[0] = [this.x-1, this.y];
			if((this.x+1)<10 && this.hitMap[this.y][this.x+1]!=true)
				res[1] = [this.x+1, this.y];
			if((this.y-1)>=0 && this.hitMap[this.y-1][this.x]!=true)
				res[2] = [this.x, this.y-1];
			if((this.y+1)<10 && this.hitMap[this.y+1][this.x]!=true)
				res[3] = [this.x, this.y+1];

			// проверка если на одной линии с текущим попаданием есть еще попадания, то исключть те что не на линии
			// если по х есть еще объект Moves убрать с у
			if((this.x-1)>=0 && isObject(this.hitMap[this.y][this.x-1]) || (this.x+1)<10 && isObject(this.hitMap[this.y][this.x+1])){
				res[2]=res[3]=null;
			}
			// если по у есть еще объект Moves убрать с х
			if((this.y-1)>=0 && isObject(this.hitMap[this.y-1][this.x]) || (this.y+1)<10 && isObject(this.hitMap[this.y+1][this.x])){
				res[0]=res[1]=null;
			}

			return res;
		}
	}

	// координаты ху для компа
	function makeXY(pl){

		var res1x = new Array(),	// возможные выстрелы без нулов
			res2x = new Array();	// возможные выстрелы с нулами из метода Moves.possibleMpves
		var randIndex = 0;
		var x = 0, y = 0;

		for(var i=0; i<10; i++){
			for(var j=0; j<10; j++){
				if(isObject(pl.hitMap[i][j]))
					res2x.push(pl.hitMap[i][j].possibleMoves());
			}
		}

		for(var i=0; i<res2x.length; i++){
			for(var j=0; j<res2x[i].length; j++){
				if(res2x[i][j])
					res1x.push(res2x[i][j]);
			}
		}

		if(res1x.length!=0){
			do{
				randIndex = randInt(0, res1x.length-1);
				x = res1x[randIndex][0];
				y = res1x[randIndex][1]
			}while(pl.hitMap[y][x]);	// исключает повторы, хз откуда они
		}else{
			do{
				x = randInt(0, 9);
				y = randInt(0, 9);
			}while(pl.hitMap[y][x]);	// если выстрел не добивание, координаты случайные
		}
		return new Array(x, y);
	}

	// обработка выстрела
	// если повтор в использованную ячейку, ф-я вызывается заново
	// при попадании вызывается метод Ship.hit, и в hitMap записывается Moves, в Cell устанавливается кружок
	// при уничтожении hitMap очищается от объектов, и в Cell красный кружок
	function attack(pl, x, y){
		console.log(pl.name + ": hit "+x+', '+y);
		if(pl.hitMap[y][x]!=null){
			console.log('Повтор');

			return true;
		}
		if(isObject(pl.opponent.navy.placement[y][x])){
			var deckID = pl.opponent.navy.placement[y][x].deckID;
			var shipNum = pl.opponent.navy.placement[y][x].shipNum;
			var numDecks = pl.opponent.navy.placement[y][x].shipObj.numDecks

			pl.opponent.navy.placement[y][x].shipObj.hit();

			if(pl.opponent.navy.placement[y][x].shipObj.isAlive){
				pl.opponent.cells[y][x].injured();
				pl.hitMap[y][x] = new Moves(x, y, pl.hitMap);

			}else{
				killShip(pl, shipNum, numDecks);
				hitMapClean(pl.hitMap);

			}

			console.log(' ship num ' + shipNum + ', deckid ' + deckID + ' num of decks '+numDecks);

			if(pl.opponent.isLose){
				pl.win();
			return false;
			}

			return true;
		}else{
			console.log(" miss");

			pl.opponent.cells[y][x].miss();
		}
		pl.hitMap[y][x] = true;
		return false;
	}

	// заменяет вссе объекты в hitMap на true
	function hitMapClean(arr){
		for(var i=0; i<10; i++){
			for(var j=0; j<10; j++){
				if(isObject(arr[i][j]))
					arr[i][j] = true;
			}
		}
	}

	// установить инфу сбоку, красный кружок и запретить использовать клетки рядом
	function killShip(pl, num, decks){
		setFleetInfo(pl.opponent, decks);
		for(var i=0; i<10; i++){
			for(var j=0; j<10; j++){
				if(isObject(pl.opponent.navy.placement[i][j]) && pl.opponent.navy.placement[i][j].shipNum == num){
					pl.opponent.cells[i][j].dead();
					occupyCell(j, i, pl.hitMap, true);
				}
			}
		}

	}

	// инфа с боку
	function setFleetInfo(pl, decks){
		var divInfoIdDecks = pl.fleetInfo+"_"+decks;
		var divInfoIdSum = pl.fleetInfo+"_Sum";

		document.getElementById(divInfoIdDecks).innerHTML = pl.navy.countAliveByDeck(decks);
		document.getElementById(divInfoIdSum).innerHTML = pl.navy.countAlive;
	}

	// кто ходит следующий
	function showTurnInfo(pl, msg){
		if(msg){
			document.getElementById('turn').innerHTML = msg;
			return;
		}
		document.getElementById('turn').innerHTML = 'Ходит ' + pl.name;
	}

	// создать idшник для ячейки по шаблону
	function createCellId(x,y,n){
		return x + '_' + y + '_' + n;
	}

	// получить idшник из ячейки по шаблону
	function numFromCellId(id){
		var x = parseInt(id.split('_')[0]);
		var y = parseInt(id.split('_')[1]);
		return [x, y];
	}

})();