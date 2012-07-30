
$ ->

	Automation = {}
	
	class HandleActions
		constructor: ->
			@loadingId = "img.loading"
			@input = "#speech-input"
			@clear = "#speech-input-clear"
			@speachUrl =
				"base": "../audio/"
				"fileType": "mp3"
			@controllerUrl = "http://10.227.48.114/iPHC2.1/IPHC-process.php?q="
			@options = 
				"lamp":
					"on": "A1+off"
					"off": "A1+on"
					"dim": "A1+dim"
					"bright": "A1+bright"
				"light":
					"on": "A4+off"
					"off": "A4+on"
					"dim": "A4+dim"
					"bright": "A4+bright"
				"fan":
					"on": "A2+off"
					"off": "A2+on"
				"mood":
					"on": "A3+off"
					"off": "A3+on"
				"study":
					"on": "B1+off"
					"off": "B1+on"
				"reading":
					"on": "B2+off"
					"off": "B2+on"
				"party":
					"on": "B3+off"
					"off": "B3+on"
				"lights":
					"on": "B4+on"
					"off": "B5+off"
			
			$(@loadingId).hide()
			@setupButtons()
			
		isTouchDevice: ->
			return !!('ontouchstart' in window)

		callController: (device, action) =>
			
			device = device.toLowerCase()
			action = action.toLowerCase()
		
			speakingCallback = (data) =>
				console.log "speaking callback"
				$(@input).val('')
				$(@clear).hide()
				$(@loadingId).hide()
		
			setTimeout(speakingCallback, 3000) # as a backup in case $.get does not finish
		
			url = @controllerUrl + @options[device][action]
			$.get(url, speakingCallback)
			
			file = @speachUrl.base + device + "-" + action + "." + @speachUrl.fileType
			$("#audio-control").attr('src', file)
			
			buttonEl = $("#"+device)
			
			if buttonEl.hasClass("on")
				buttonEl.removeClass("on")
			else
				buttonEl.addClass("on")
		
		setupButtons: ->

			buttonClicked = (event) =>
				#console.log "button clicked " + event.target.id + " " + $(event.target).hasClass("selected")
				el = $(event.target)
				device = event.target.id
				
				if el.hasClass("on") then action = "off" else action = "on"
				
				@callController(device, action)
		
			event = if @isTouchDevice then "tap" else "click"
			$("ul", "#shortcuts").on(event, buttonClicked)
			
		processCommand: (phrase) ->
			
			if not phrase? then return;
			
			device = null
			action = null
			phraseArry = phrase.split(" ")

			speak = (_device, _action) =>
				@callController(_device, _action)
				$(@loadingId).show()

			processWords = (words) =>
				for word in words
					word = word.toLowerCase()
					if device?
						if @options[device][word]?
							action = word
							console.log "action: " + action
							speak(device, action)
							break;
					else if @options[word]?
						device = word
						console.log "device: " + device
						processWords(words)
						break;
								
			processWords(phraseArry)

	class AppView extends Backbone.View
		el_tag = "#home-wrapper"
		input_tag = "#speech-input"
		clear_tag = "#speech-input-clear"
		
		el: $(el_tag)
		
		events:
	 		"keypress #speech-input"				: "createOnEnter"
	 		"input #speech-input"						: "inputChanged"
	 		"mousedown #speech-input-clear"	: "clearCompleted"
	
		initialize: =>
			console.log "init app view"
			@input = this.$(input_tag)
			@clearBtn = this.$(clear_tag)
			@clearBtn.hide()
	
		inputChanged: (e) ->
			val = @input.val()
			if val.length > 0
				Automation.actions.processCommand(val)
				@clearBtn.show()
			else
				@clearBtn.hide()
				
		createOnEnter: (e) ->
			return if (e.keyCode != 13)
			val = @input.val()
			Automation.actions.processCommand(val)
			e.preventDefault() if e
	
		clearCompleted: (e) ->
			@input.val("")
			@clearBtn.hide()
			e.preventDefault() if e
	
	class Router extends Backbone.Router
		routes:
			"": "defaultRoute"
			
		initialize: ->
			console.log "init router"
			
		defaultRoute: ->
			console.log "default route"
			Automation.actions = new HandleActions()
			Automation.app = new AppView()

	appRouter = new Router()
	Backbone.history.start()
