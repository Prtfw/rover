Basic Requirments:
    - Take command, return position, [wait for command...]
    - Commands: turn (L/R/M) = (turn left, turn right, move one unit)
    - Positon: [x,y,direction]

Approach: Declarative
Why?:
    - object oriented? possible overkill = no mention of multiple rovers or interactions with other objects, more suitable if we need to scale.
    - functional? possible overkill = no concurrency requirements, user commands are executed in sequence (result is sequence dependent), no requirement for multiple users to work on the same rover, low risk to maintain and mutate state
    - declarative: fast, simple, readable code

State/Variables:
    - current direction
    - current x,y coordinate: depends on direction (for signs i.e. for y-ax North = Positive) and number of “M”/moves
    - as object: easier to use (i.e. can use dot notation state.x, state.y, instead of state[0], state[1], easier typing, less chance of “off by 1 errors”)
    - history? (might be useful for rolling back, or graphing if UI is implemented) => implement if using canvas for UI

Breakdown:
    Actions:
    	- direction: L/R command => try modulo + array ? do “notebook” mock up => works
    		- JS included modulo operator (%) did not behave as expected (not the same behaviour as Modulo in math, apparently a known bug/feature… write custom mod function)
    	- x,y coordinate: depending on the direction =>determine which axis and sign (+/-) & number of “moves”
    	- restart/finish: refresh browser or reset state
    UI?:
    	- possibly low "effort to value ratio" => would be cool to test out canvas

80% solution hashed out => start coding:

[wrote individual functions that updates state based on L/R/M commands]
[Iterate through entire command using forEach]

Tests:
1. a+b == c == x+y+z: (LMM,RMM, LMMM) = (LMMRMMLMMM) = (LMMRMM, LMMM)
2. direction tests: MMM=[0,-3]

Refactor/Optimization 1:
    - likely to have more “M”s than “L/R”s (unless rover just likes to spin around and not go anywhere) => batch “M”s that are together instead of move one unit at a time using regex with split
    - refactor into smaller, single purpose functions, rename functions for readability

=====>>>>>>>>>>>>>>>>

UI?
    - add simple form to enter command and go! buttons
    - use canvas? … did scalability test of drawing 1000 random lines, didn’t take too long (performance okay) => okay to proceed 

Refactor/Optimization 2: 
    - add a "state" element called last = an array of previous locations
    - write function to redraw the path as per array coordinate
    - add rover png to mark last location on “map”/canvas for better presenation
    - add undo function and buttons (since we have last/history for Canvas anyways)

UX?
    - would be good to see the last locations as a scrollable list 
    - how can users break my code?
        - enter the wrong command => validate before [go!] button activated, show a good error message
        - enter giant list of “M”s => moves off canvas => need to scale path

Refactor/Optimization 3: 
    - scale path (x,y) coordinates to take account of the length of path so the canvas will "zoom out/zoom in" as you explore
    - add front end user command validation

Final Visual Testing: (includes same tests as above)
1. a+b = c = x+y+z
2. direction tests
3. M length test (testing optimization 1, multiple "M"s = one move)
4. scale test (giant command sequence, assume the previous test are passing this one is only to validate performance)
	
=====>>>>>>>>>>>>>>>>

Future pipeline?:
- add visual direction indicator: add arrow to rover image?, add direction indicator to edge of canvas?, animate rotation of rover image?
- integrate into image api and show “street view” of a dessert area as we move the rover (which looks like/simulates planetary surface) => test out google street view image/search api  : )
- add tests using "expect" library
- add gridlines to canvas
- make more responsive, mobile testing
- add eastereggs (probability of finding aliens, hitting volcanos etc…)
- animate path: set-timeout in path drawing function?
- turn into a node micro-service api?
- persistence: local storage? (probably not that useful)
