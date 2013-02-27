if(typeof exports === 'undefined') {
	rye = window;
} else {
 	rye    = require('../lib/rye.js');
 	should = require('chai').should(); 
 }

describe('class IntegerRing', function() {
	var ring = new rye.IntegerRing();
	
	it('can be factorized', function() {
		ring.factorSet(3).should.eql([0, 1, 2]);
		(function() {ring.factorSet(0)}).should.throw();
	});
	
	it('can divide by a modulo', function() {
		ring.mod(73, 10).should.equal(3);
		ring.mod(0, 243).should.equal(0);
		(function() { ring.mod(1337, 0); }).should.throw();
	});
});