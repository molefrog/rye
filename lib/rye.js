
// --------------------------------------------------------------------
// Auxiliary functions
// --------------------------------------------------------------------

function baseExpand(num, base) {
    if (num < base) {
		return [num];
	}

    var modulo = num % base;
    var result = baseExpand((num - modulo) / base, base);
    result.unshift(modulo);
    return result;        
}
    
function baseContract(powers, base, accumulator) {
	accumulator = accumulator || 1;
	if(powers.length <= 0) {
		return 0;
	}

    var result = powers[0] * accumulator;	
	accumulator *= base;
	
	return (result + baseContract(powers.slice(1), base, accumulator));
}

// --------------------------------------------------------------------
//                        PrimeField class
// This function constructs a prime field with given order.
// Note, that the order should be prime to let this structure
// be real field. 
// --------------------------------------------------------------------

function PrimeField(order) {
    // Of course, there is no check for order to be prime 
    if (order <= 1) {
        throw new Error('Invalid prime field order!');
    }

    // The order is count of elements contained by field
    this.order = order;

    // The type of this is prime, means that this field is isomophic to
    // field of congruence with prime number as an order
    this.type = 'prime';
	
	
	this.nullElement = function() {
		return 0;
	};
	
	this.oneElement = function() {
		return 1;
	};


    // ---------------------- Normalize function --------------------------
    // This function normalizes an element of the field
    this.normalize = this.norm = function(x) {
        if (!x) {
            // For cases when x has bad value!
            return 0;
        }
        if (x < 0) {
            // Minus means that this element is inversed
            return this.opp((-x) % order);
        } else {
            // Normalizing by a module of field order 
            return (x % order);
        }
    };

    // ---------------------- Inverse function ---------------------------
    // This function return inversed element of x
    // x -> y that x*y (mod p) = 1
    this.inverse = this.inv = function(x) {
        // Normalizing number
        x = this.norm(x);

        // The Null element can't be inversed!
        if (x === 0) {
            return NaN;
        }

        // Follow Fermat's little theorem the inverse version of x 
        // is (p-2) power of x (by module of order, of course)
        // TODO: this can be slow! Sometimes it's better to calculate 
        // all inversed elements at the moment the field is building!
        var result = x;
        var i = (order - 3);
        for (; i > 0; --i) {
            result = this.mul(result, x);
        }

        return result;
    };

    // ---------------------- Opposite function ---------------------------
    // This function returns opposite element of x
    // x -> y that x+y = 0
    this.opposite = this.opp = function(x) {
        // Since we are working in a ring of congruence the inverse
        // version of x is simple (p-x) mod p
        return (order - this.norm(x)) % order;
    };

    // ---------------------- Addition function ---------------------------
    // This function adds two elements of the field
    // (x,y) -> (x+y) mod p
    this.addition = this.add = function(x, y) {
        return ((this.norm(x) + this.norm(y)) % order);
    };

    // ------------------- Multiplication function -------------------------
    // This function multiplicates two elements of a field
    // (x,y) -> (x*y) mod p
    this.multiplication = this.mul = function(x, y) {
        return ((this.norm(x) * this.norm(y)) % order);
    };

    // This function returns real element representation
    // The thing is that the index of the element and the element
    // itself are completely different abstractions. 
    // For example, element with index 0 can represent a rotation 
    // transformation by 0 degrees(if we talk about field of 
    // transformations).
    // x -> Representation(x)
    // () -> Representation(Field)    
    this.element = this.elements = function(x) {
        if (x === undefined) {
            // x is undefined so we have to return whole field as an array
            var fieldElements = new Array(order);
            var i = 0;
            for (; i < order; ++i) {
                // Get representation for each element
                fieldElements[i] = this.element(i);
            }

            return fieldElements;
        }

        // Simply return normalized element
        return this.norm(x);
    };


    // This function returns LaTeX string of defined element
    // I know that this is not the best solution, so for future:
    // think about creating separate class for this
    this.toLatex = this.latex = function(x) {
        // Will help us to work inside callbacks
        var self = this;

        if (x === undefined) {
            // Return latex string for whole field
            var elementsLatex = new Array(order);
            var i = 0;

            for (; i < order; ++i) {
                // Getting latex string for each element in the field
                elementsLatex[i] = self.toLatex(i);
            }

            var result =
            // Formatting field name
            '\\mathbb{F}_{' + order + '} = ' +
            // Formatting set of elements
            '\\left \\{' + elementsLatex.join(', ') + '\\right \\}';

            return result;

        }
        // Return latex string for one element
        return '[' + this.element(x) + ']_{' + order + '}';
    };
}


 

// --------------------------------------------------------------------
//                        PolynomRing class
// This class represents a ring of polynoms with coefficients from 
// given field. 'Ring' means that this structure provides such operations:
// 1. Addition
// 2. Multiplication
// 3. Inversion in terms of addition(finding opposite element)
// All functions operate with instances of the Polynom class(not indexes 
// like in fields classes, because ring is a infinite structure!).
// --------------------------------------------------------------------
function PolynomRing(field) {
    // The field that contains coefficients values
    this.field = field;
	
	// --------------------------------------------------------------------
	// This function constructs a polynom with coefficients from current 
	// field. Note that this polynom is ummutable, e.g. you can't change
	// it's coefficients values!
	// The first parameter is an array of indexes of this field's elements.
	// --------------------------------------------------------------------
	this.polynom = function (coefficients) {
		// If coefficients are not defined then the polynom is null
		coefficients = coefficients || [0];
				
		// Calculating the power of the polynom
		var _power = coefficients.length - 1;	
        // Skip all high-order nulls
        while (_power >= 0 && coefficients[_power] === 0 ) {
            --_power;
        }
		// The power of the null polynom is minus infinity
        if (_power === -1) {
            _power = -Infinity;
        }
		
		// Copying indexes to the private array
		var _coefficients = coefficients.slice(0, (_power === -Infinity) ? 1 : (_power + 1));
		
		// Creating an empty object
		var polynomInstance = {};
		
		// The ring to which this polynom belongs
		polynomInstance.ring  = this;
		
		// The field in which coefficients are contained
		polynomInstance.field = this.field;
		
		// This function returns the power of the polynom
		polynomInstance.power = function() {
			return _power;
		};
		
		// This function returns the array of the coefficients
		polynomInstance.coefficients = polynomInstance.coefs = function() {
			// Returning the copy of the original array
			return _coefficients.slice();
		};
		
		// This function returns the value of specified coefficient
		polynomInstance.coefficient = polynomInstance.coef = function(index) {
			// The null polynom has null coefficients
			if(_power === -Infinity) {
				return this.field.nullElement();
			}	
			
			// We shouldn't throw error in case of bad index, because other 
			// coefficients in fact are null.
			if (index >= 0 && index <= _power) {
				return _coefficients[index];
			} else {
				return this.field.nullElement();
			}
		};
		
		// This function applicates given value to the polynom, i.e. it returns 
		// a value of the polynom in the specified point
		polynomInstance.application = polynomInstance.app = function(value) {
			// The value of the null polynom is null
			if(_power === -Infinity) {
				return this.field.nullElement();
			}
			// This will hold result
			var result = this.field.nullElement();
			
			// The current power of x
			var valuePower = this.field.oneElement();

			// Calculating the sum of monomials applicated with this value
			var currentPower = 0;
			for (currentPower = 0; currentPower <= _power; ++currentPower) {
				result = this.field.add(result, this.field.mul(valuePower, this.coef(currentPower)));
				// Calculating the next power of x
				valuePower = this.field.mul(valuePower, value);
			}

			return result;
		};
		
		// Returning constructed object
		return polynomInstance;
    };
	
	// --------------------------------------------------------------------
	// 						Euclidean norm function
	// Mnemonics: f(x) -> deg(f(x))
	// This function returns euclidean norm of the given element. For 
	// polynoms it's just a power of a polynom.
	// --------------------------------------------------------------------
	this.norm = function(f) {
		return f.power();
	};
	
	// --------------------------------------------------------------------
	// 					Number of elements with norm function
	// Mnemonics: i -> |{ f(x) that deg(f(x))=i }|
	// This function returns number of elements of the ring with given 
	// euclidean norm.
	// --------------------------------------------------------------------
	this.normCount = function(norm) {
		// There is only one null element!
		if(norm === -Infinity) {
			return 1;
		}
		
		return (this.field.order - 1) * (Math.pow(this.field.order, norm));
	};

	// --------------------------------------------------------------------
	// 						 Element-to-index function
	// Mnemonics: i -> f(x)
	// This function returns an index of the given element of the ring
	// --------------------------------------------------------------------
	this.index = function(f) {
		// Contracting coefficients with field's order as a base
		return baseContract(f.coefficients(), this.field.order);
	};
	
	// --------------------------------------------------------------------
	// 						Index-to-element function
	// Mnemonics: f(x) -> i
	// This function returns an element of the ring with given index
	// --------------------------------------------------------------------
	this.element = function(i) {
		// Expanding an index to a coefficients with field's order as a base
		var elementCoefficients = baseExpand(i, this.field.order);
		
		// Constructing a polynom with calculated coefficients
		return this.polynom(elementCoefficients);
	};
	
  	// --------------------------------------------------------------------
	// 							Addition function
	// Mnemonics: (f(x), g(x)) -> (f(x) + g(x))
    // This funcion adds two polynoms. Note that f and g are instances of
    // internal class polynom, but not indexes, cause ring is an infinite 
	// structure 
	// --------------------------------------------------------------------
    this.addition = this.add = function(f, g) {
        // The power is maximum power of two polynoms
        var power = Math.max(f.power(), g.power());
		
		// The case when both polynoms are null
		if (power === -Infinity) {
			return this.polynom();
		}
		
        // Allocating an array for coefficients
        var sumCoefs = new Array(power + 1);

        var i;
        for (i = 0; i <= power; ++i) {
            // Calculate sum of the coeffients using field arithmetics
            sumCoefs[i] = this.field.add(f.coef(i), g.coef(i));
        }

        // Return new polynom with calculated coefficients
        return this.polynom(sumCoefs);
    };

	// --------------------------------------------------------------------
	// 						Multiplication function
	// Mnemonics: (f(x), g(x)) -> (f(x) * g(x))
    // This function calculates the product of two polynoms    
	// --------------------------------------------------------------------
    this.multiplication = this.mul = function(f, g) {
        // Calculate the power of product polynom (sum of powers)
        var power = f.power() + g.power();
		
		// The case when at least one of polynoms is null
		if (power === -Infinity) {
			return this.polynom();
		}
		
        // Allocate memory for product coefficients        
        var productCoefs = new Array(power + 1);

        var i, j;
        for (i = 0; i <= power; ++i) {
            var currentCoefficient = 0;
            for (j = 0; j <= i; ++j) {
                // Calculating coefficient using formula sum(i=1..n+m) f(j)*g(i-j)
                currentCoefficient = field.add(
                    field.mul(f.coef(j), g.coef(i - j)), 
                    currentCoefficient);
            }

            // Assigning current coefficient
            productCoefs[i] = currentCoefficient;
        }

        // Returning new polynom with calculated coefficients
        return this.polynom(productCoefs);
    };

    // --------------------------------------------------------------------
	// 						Opposite function
	// Mnemonics: f(x) -> -f(x)
    // This function returns an opposite polynom to the specified
	// --------------------------------------------------------------------
    this.opposite = this.opp = function(f) {
        var self = this;

        // Coefficients of the opposite polynom are also opposite
        var oppCoeffs = f.coefficients().map(function(coefficient) {
            return self.field.opposite(coefficient);
        });

        return this.polynom(oppCoeffs);
    };

	// --------------------------------------------------------------------
    // 							Module function
	// Mnemonics: (f(x), g(x)) -> (f(x) mod g(x))
    // This function calculates the module of division one polynom to another
	// --------------------------------------------------------------------
    this.modulo = this.mod = function(f, g) {
        // Calculating a power of each polynom
        var powerF = f.power();
        var powerG = g.power();

        // When power of f (divident) is less than power of g (divisor) than
        // modulo is simply f
        if (powerF < powerG) {
            return f;
        }
		
		// We can't divide by the null polynom
		if( powerG === -Infinity) {
			throw new Error('Division by zero element of the ring!');
		}

        // Constructs an array for divisor polynom
        var divisor = Array(powerF + 1);

        // Now we are trying to build polynom which will decrease the divident
        // power by one. To do that we shift divisor and multiply all its 
        // coefficient by special element(to fill highest coefficient of the
        // divident(f) with null.
        var i;
        for (i = 0; i <= powerF; ++i) {
            if (i >= powerF - powerG) {
                var j = (i - powerF + powerG);
                // Doing all transformation with coefficients(in field 
                // arithmetics of course)
                var coef = field.mul(g.coef(j), 
                                     field.mul(f.coef(powerF), 
                                               field.inv(g.coef(powerG))));

                divisor[i] = field.opp(coef);
            }
            // This will make shift
            else {
                divisor[i] = 0;
            }
        }
        
        // Now adding this stuff to f and repeat this algorithm with a new,
        // 'less-powerful' divident
        return this.mod(this.add(f, this.polynom(divisor)), g);
    };
}


// --------------------------------------------------------------------
//                        FactorRing class
// This class represents a ring that built as a factor of the given
// ring by module of pricipal ideal with given generator.
// --------------------------------------------------------------------
function FactorRing(ring, generator) {
	// This will help us to access object inside a callback
	var self = this;
	
	// The ring that will be factorized
	self.ring = ring;
	// The base element of the ideal
	self.generator = generator;	
	
	// Now lets calculate an order. The factor ring consist of elements,
	// whose norm is less that norm of base element. Using the normCount()
	// function of the ring we can calculate total order.
	this.order = (function calculateOrder() {
		// Don't forget about the null element!
		var order = self.ring.normCount(-Infinity);	
			
		var i = 0, j = 0;
		for( i = 0; i < self.ring.norm(generator); ++i) {
			// Using normCount() function to calculate the number of 
			// elements of the ring with current norm.
			order += self.ring.normCount(i);	
		} 
		
		// Returning calculated order
		return order;
	}) ();
	
	
	// Allocating private data
	var nullIndex 	= NaN; 	// The index of the null element
	var oneIndex 	= NaN;	// The index of the one element
	
	// Allocating private tables. It will speed up some operations like
	// finding an inverse element or opposite element
	var elementsTable 		= new Array(this.order);
	var additionTable 		= new Array(this.order);
	var multiplicationTable = new Array(this.order);
	var inverseTable  		= new Array(this.order);
	var oppositeTable 		= new Array(this.order);
	
	// Now lets fill the elements table
	(function fillElementsTable() {	
		var i = 0;
		for(i = 0; i < self.order; ++i) {
			// Using indexing function from the ring 
			elementsTable[i] = self.ring.element(i);
		}
	}) ();
	
	// Now lets fill the addition table. Also we'll probably find
	// the null element. 
	(function fillAdditionTable() {
		var i = 0, j = 0;
		for(i = 0; i < self.order; ++i) {
			// Allocating row in current cell
			additionTable[i] = new Array(self.order);
			
			for(j = 0; j < self.order; ++j) {
				// To be sure, that all table will be filled clearly.
				additionTable[i][j] = NaN;
				
				// Calculating sum element in terms of the ring
				var sumIndex = self.ring.index(
					self.ring.mod(
						self.ring.add(elementsTable[i], elementsTable[j]),
						self.generator	// Factorising
					)
				);
					
				// Filling the table entry
				additionTable[i][j] = sumIndex;
				
				// To find null element we are using theorems:
				// 1. a+a=a <=> a=1 (in ring)
				// 2. There is only one null element in a ring
				if( i === j && j === sumIndex) {
					nullIndex = i;
				}
			}
		}
	}) ();
	
	// Now lets fill the multiplication table. Also we'll probably find
	// the one element. 
	(function fillMultiplicationTable() {
		var i = 0, j = 0;
		for(i = 0; i < self.order; ++i) {
			// Allocating row in current cell
			multiplicationTable[i] = new Array(self.order);
			
			for(j = 0; j < self.order; ++j) {
				// To be sure, that all table will be filled clearly
				multiplicationTable[i][j] = NaN;
			
				// Calculating multiplication in terms of the ring
				var multIndex = self.ring.index(
					self.ring.mod(
						self.ring.mul(elementsTable[i], elementsTable[j]),
						self.generator	// Factorising
					));
				
				// Filling the table entry
				multiplicationTable[i][j] = multIndex;

				// To find the one element using theorems:
				// 1. a*a=a a!=0 <=> a=1
				// 2. There is only one 'one' element(if exists)
				if( i === j && j === multIndex && i !== nullIndex) {
					oneIndex = i;
				}
			}
		}
	}) ();
	
	// Now we are trying to fill the opposite and inverse table.
	// Note, that not all the elements can be inversed(in this 
	// case the inversed index is NaN)
	(function fillOppInvTables() {
		var i = 0, j = 0;
		for( i = 0; i < self.order; ++i) {
			// Filling with NaNs
			oppositeTable[i] = NaN;
			inverseTable[i]  = NaN;
			
			for( j = 0; j < self.order; ++j) {
				// Opposite element definition:
				// b = (-a) <=> def a+b=b+a=0
				if(additionTable[i][j] === nullIndex) {
					oppositeTable[i] = j;
				}
				
				// Inverse element definition:
				// b = 1/a <=> def b*a=1 (a!=0, b!=0)
				if(multiplicationTable[i][j] === oneIndex) {
					inverseTable[i] = j;
				}
			}
		}
	}) ();
	
	// --------------------------------------------------------------------
	// 						Element-by-index function
	// Mnemonics: i -> R(i)
	// This function returns element of the ring by its index
	// --------------------------------------------------------------------
	this.element = function(i) {
		return elementsTable[i];
	};
	
	// --------------------------------------------------------------------
	// 						Index-by-element function
	// Mnemonics: e -> I(e)
	// This function returns the index of the given element
	// --------------------------------------------------------------------
	this.index = function(e) {
		return this.ring.index(e);
	};
	
	// --------------------------------------------------------------------
	// 						Null element index function
	// Mnemonics: () -> (i that R(i)=0 (for each a a+R(i)=a mod B))
	// This function returns the index of the null element
 	// --------------------------------------------------------------------
	this.nullElement = function() {
		return nullIndex;
	};

	// --------------------------------------------------------------------
	// 						One element index function
	// Mnemonics: () -> (i that R(i)=1 (for each a!=0 a*R(i)=a mod B))
	// This function retruns the index of the one element
	// --------------------------------------------------------------------	
	this.oneElement = function() {
		return oneIndex;
	};
	
	// --------------------------------------------------------------------
	// 						Addition function
	// Mnemonics: (i,j) -> I(R(i) + R(j) mod B)
	// This function adds two elements of the factor ring(by indexes)
	// --------------------------------------------------------------------
	this.addition = this.add = function(i, j) {
		return additionTable[i][j];
	};
	
	// --------------------------------------------------------------------
	// 						Multiplication function
	// Mnemonics: (i,j) -> I(R(i)*R(j) mod B)
	// This function multiplicates two elements of the factor ring (by 
	// indexes)
	// --------------------------------------------------------------------
	this.multiplication = this.mul = function(i, j) {
		return multiplicationTable[i][j];
	};
	
	// --------------------------------------------------------------------
	// 						Opposite element function
	// Mnemonics: i -> (j that (R(i)+R(j) mod B) = R(0))
	// This function returns the index of the opposite element of the given
	// --------------------------------------------------------------------
	this.opposite = this.opp = function(i) {
		return oppositeTable[i];
	};
	
	// --------------------------------------------------------------------
	// 						Inverse element function
	// Mnemonics: i -> (j that (R(i)*R(j) mod B) = R(1))
	// This function returns the index of the inversed element of the given
	// --------------------------------------------------------------------
	this.inverse = this.inv = function(i) {
		return inverseTable[i];
	};
}




