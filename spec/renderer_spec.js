describe("Renderer", function() {
	var renderer,
		app;
	beforeEach(function() {
		renderer = require('../libs/renderer.js');
		app = renderer.democritus;
	});

	it("should have renderer function defined", function() {
		expect(app).toBeDefined();
	});

	it("should clean public/patterns path before write the patterns", function() {
		spyOn(app, 'cleanPaths').and.callFake(function() {
			app.getPatterns();
		});

		spyOn(app, 'getPatterns').and.callFake(function() {
			return true;
		});

		app.init();
		expect(app.cleanPaths).toHaveBeenCalled();
		expect(app.getPatterns).toHaveBeenCalled();
	});
});