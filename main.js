var CorySim = {};
var LG = console.log;
/*

behaviours
	tired
	sad
	happy
	content
	angry

actions
	feed
	put to bed
	play
	punish
	reward


taking turns

update
	face
	mood

*/

CorySim.ENUM = {};
(function (self) {
	self.MOOD = {
		TIRED: 0,
		SAD: 1,
		HAPPY: 2,
		CONTENT: 3,
		ANGRY: 4
	};

	self.BEHAVIOUR = {
		IDLE: 0,
		EATING: 1,
		PLAYING: 2,
		SLEEPING: 3
	};

})(CorySim.ENUM)


CorySim.Behaviour = {};
(function (self) {

	var currentBehaviour = CorySim.ENUM.BEHAVIOUR.IDLE;
	var b = CorySim.ENUM.BEHAVIOUR;
	var actionLength = 3;
	var currentAction = 0;
	self.get = function () {
		return currentBehaviour;
	};


	self.Play = function () {
		if (currentBehaviour !== b.IDLE) {
			LG("Cory is already doing something.")
			return;
		}
		currentAction = actionLength;
		currentBehaviour = b.PLAYING;
	};
	self.Sleep = function () {
		if (currentBehaviour !== b.IDLE) {
			LG("Cory is already doing something.")
			return;
		}
		currentAction = actionLength;
		currentBehaviour = b.SLEEPING;
	};
	self.Eat = function () {
		if (currentBehaviour !== b.IDLE) {
			LG("Cory is already doing something.")
			return;
		}
		currentAction = actionLength;
		currentBehaviour = b.EATING;
	};

	self.tick_Behaviour = function () {

		if (currentAction == 0) {
			return;
		}
		if (currentBehaviour == b.IDLE) {
			return;
		}
		switch (currentBehaviour) {
			case b.IDLE:
				LG("Cory is doing nothing...");
				return;
			case b.EATING:
				LG("Cory is eating...");
				break;
			case b.SLEEPING:
				LG("Cory is sleeping...");
				break;
			case b.PLAYING:
				LG("Cory is playing...")
				break;
		}
		currentAction--;
		CorySim.Mood.update();
	}

})(CorySim.Behaviour)

CorySim.Mood = {};
(function (self) {
	var m = CorySim.ENUM.MOOD;

	var currentMood = b.CONTENT;

	var moodLow = 0;
	var moodHigh = 100;
	var happiness = 50;
	var temper = 10;

	var NEEDS = [
	10, //Hunger
	10,	// bordom
	10 //Sleep
	]

	self.getMood = function () { return currentMood; };
	self.getNeeds = function () { return NEEDS; };
	function setMood(mood) {

		currentMood = mood;
	}

	self.update = function () {
		updateNeeds();
		updateMood();

		if (happiness > 65) {
			setMood(m.HAPPY);
		} else if (happiness < 40) {
			setMood(m.SAD);
		} else {
			setMood(m.CONTENT);
		}


	}

	function updateMood() {
		var moodIncrease = 4;
		var moodDecrease = 4 + moodIncrease;

		for (var x = 0; x > NEEDS.length; x++) {
			if (NEEDS[x] < 50) {
				happiness = happiness - (moodDecrease / 2);
			} else {
				happiness = happiness + (moodIncrease / 2);
			};
		}


		if (happiness < moodLow) {
			happiness = moodLow;
		}
		else if (happiness > moodHigh) {
			happiness = moodHigh;
		}
	}

	function updateNeeds() {

		var needIncrease = 4;
		var needDecrease = 4 + needIncrease;

		for (var x = 0; x > NEEDS.length; x++) {
			NEEDS[x] = NEEDS[x] + needIncrease;
		}

		var cb = CorySim.Behaviour.get()
		switch (cb) {
			case 0:
				break;
			case 1:
				//Eating
				NEEDS[cb + 1] = NEEDS[cb - 1] + needDecrease;
				break;
			case 2:
				//Playing
				NEEDS[cb + 1] = NEEDS[cb - 1] + needDecrease;
				break;
			case 3:
				//Sleeping
				NEEDS[cb + 1] = NEEDS[cb - 1] + needDecrease;
				break;
		}
	}



})(CorySim.Mood)

CorySim.UI = {};
(function (self) {

	function updateMood() {
		var mood = CorySim.Mood.getMood();
		var children = $("#mood").find("h3").children()
		children.hide()
		children[mood].show();
	};


	function updateNeeds() {
		var needs = CorySim.Mood.getNeeds();
		var children = $("#needs").find("h3").children();
		needs.forEach(function (e, i) {
			if (e < 50) {
				children[i].hide()
			} else if (e > 50) {
				children[i].show();
			}
		});
	};


	self.updateUI = function () {

		updateMood();
		updateNeeds();

	};


	self.bindButtons = function () {

		var con = $("#controller");
		con.find("#feed").click(function () {
			CorySim.Core.pendingTasks.push(CorySim.Actions.feed);
		});

		con.find("#play").click(function () {
			CorySim.Core.pendingTasks.push(CorySim.Actions.play);
		});
		con.find("#put-to-bed").click(function () {
			CorySim.Core.pendingTasks.push(CorySim.Actions.bed);
		});

	};

	self.init = function () {
		self.bindButtons();
	};


})(CorySim.UI)


CorySim.Actions = {};
(function (self) {

	self.feed = function () {
		CorySim.Behaviour.Eat();
		LG("You are feeding Cory...");
	}
	self.play = function () {
		CorySim.Behaviour.Play();
		LG("You are playing with Cory...");
	}
	self.bed = function () {
		CorySim.Behaviour.Sleep();
		LG("You are putting Cory to bed...");
	}

})(CorySim.Actions)



CorySim.Core = {};
(function (self) {

	var gamePaused = true;
	self.Pause = function () {
		gamePaused = true;
	};

	self.Unpause = function () {
		gamePaused = false;
	};

	self.pendingTasks = [];
	var gameTick = 1000
	self.newTurn = function () {
		if (gamePaused) {
			waitNextTurn();
		} else {

			CorySim.Behaviour.tick_Behaviour;
			CorySim.UI.update();

			self.pendingTasks.forEach(function (e) {
				e();
			});

			waitNextTurn();
		}
	};

	function waitNextTurn() {
		setInterval(self.newTurn(), gameTick)
	}

	self.init = function () {
		CorySim.UI.init();
		self.Unpause();
		waitNextTurn();
	};

})(CorySim.Core)




CorySim.Core.init();

















