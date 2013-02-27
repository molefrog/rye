if(typeof exports === 'undefined') {
	rye = window;
} else {
 	rye    = require('../lib/rye.js');
 	should = require('chai').should(); 
 }

describe('class FactorRing', function() {
	var field3 = new rye.PrimeField(3);
	var field7 = new rye.PrimeField(7);
	
	var ring3 = new rye.PolynomRing(field3);
	var ring7 = new rye.PolynomRing(field7);
	
	var f1 = new rye.FactorRing(ring3, ring3.polynom([1, 0, 1]));
	var f2 = new rye.FactorRing(ring7, ring7.polynom([3]));
	
	it('has order property', function() {
		f1.order.should.equal(3*3);
		f2.order.should.equal(1);
	});
	
	it('has null element', function() {
		var i=0;
		f1.nullElement().should.equal(0);
		for(i=0; i<f1.order; ++i) {
			f1.add(i, f1.nullElement()).should.equal(i);
		}
	});
	
	it('has one element if base is irreducible', function() {
		var i=0;
		f1.oneElement().should.equal(1);
		
		for(i=0; i<f1.order; ++i) {
			f1.mul(i, f1.oneElement()).should.equal(i);
		}
	});	
	
	it('can add two elements', function() {
		f1.add( 
			f1.index( ring3.polynom([1, 2])), 
			f1.index( ring3.polynom([0, 2]))
		).should.equal(f1.index(ring3.polynom([1, 1])));	
		
		f1.add( 
			f1.index( ring3.polynom([2, 2])), 
			f1.index( ring3.polynom([1, 2]))
		).should.equal(f1.index(ring3.polynom([0, 1])));	
	});
	
	it('can multiply two element', function() {
		f1.mul( 
			f1.index( ring3.polynom([0, 2])), 
			f1.index( ring3.polynom([2, 2]))
		).should.equal(f1.index(ring3.polynom([2, 1])));	
	});
	
	
	it('can obtain opposite element', function() {
		var i=0;
		
		for(i=0; i<f1.order; ++i) {
			f1.add(i, f1.opp(i)).should.equal(f1.nullElement());
		}
	});
	
	it('can obtain inverse element', function() {
		var i=0;
		
		isNaN(f1.inv(f1.nullElement())).should.be.ok;
		
		for(i=0; i<f1.order; ++i) {
			var inv = f1.inv(i);
			if(!isNaN(inv)) {
				f1.mul(i, inv).should.equal(f1.oneElement());
			}
		}
	});

});