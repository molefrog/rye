
// --------------------------------------------------------------------
// 							Auxiliary functions
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
//							IntegerRing class
// This class represents the ring of integers. Its elements can be
// added, multiplied or divided by each other. Each element has also
// the norm property, and it can be inversed.
// The elements of this ring are just integer numbers.
// --------------------------------------------------------------------
function IntegerRing() {
	// --------------------------------------------------------------------
	// 						Factor set function
	// Mnemonics: x -> { [y mod x] }
	// This function returns elements of the ring by module of given element
	// --------------------------------------------------------------------
	this.factorSet = function(element) {
		// Calculating the order of factor ring
		var order = this.norm(element);
		// Doing a check that element is not null
		if(order === -Infinity) {
			throw 'Factorization by zero!'
		}
		
		// Allocating an array of elements
		var set = new Array(order);
		// Filling it with numbers [0..x]
		var i = 0;
		for(i=0; i<order; ++i) {
			set[i] = i;
		}
		// Returning result
		return set;
	};
	
	// --------------------------------------------------------------------
	//							Equality function
	// Mnemonics: (x,y) -> x==y
	// This function compares two elements of the ring.
	// --------------------------------------------------------------------
	this.equal = function(x, y) {
		return (x === y);
	};
	
	// --------------------------------------------------------------------
	// 							Norm function
	// Mnemonics: x -> |x|
	// This function returns the norm of the given element. The norm is just
	// an absolute value of number or minus infinity if number is null
	// --------------------------------------------------------------------
	this.norm = function(x) {
		if(x === 0) {
			// The norm of null number is minus infinity
			return -Infinity;
		}
		
		// Returning absolute value
		return Math.abs(x);
	};
	
	// --------------------------------------------------------------------
	// 							Addition function
	// Mnemonics: (x,y) -> x+y
	// This function adds two elements of the ring
	// --------------------------------------------------------------------
	this.addition = this.add = function(x, y) {
		return x+y;
	};	
	
	// --------------------------------------------------------------------
	// 						Multiplication function
	// Mnemonics: (x,y) -> x*y; 
	// This function multiplicates two elements of the ring.
	// --------------------------------------------------------------------
	this.multiplication = this.mul = function(x, y) {
		return x*y;
	};	
	
	// --------------------------------------------------------------------
	// 						Opposite element function
	// Mnemonics: x -> -x 
	// This function returns inversed(in terms of addition) version of
	// the given element.
	// --------------------------------------------------------------------
	this.opposite = this.opp = function(x) {
		return -x;
	};
	
	// --------------------------------------------------------------------
	// 							Modulo function
	// Mnemonics: (x,y) -> x mod y
	// This function retuns the modulo of division one integer to another.
	// --------------------------------------------------------------------
	this.modulo = this.mod = function(x, y) {
		if( this.norm(y) === -Infinity) {
			throw 'Division by zero!';
		}
		
		return x % y;
	}
	
	// --------------------------------------------------------------------
	// 						Latex string function
	// This function returns latex representation of the given integer
	// --------------------------------------------------------------------
	this.toLatex = function(x) {
		return x.toString();
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
		if(coefficients === undefined || coefficients.length === 0) {
			coefficients = [0];
		}
		
		// Creating an empty object
		var polynomInstance = {};
		
		// The ring to which this polynom belongs
		polynomInstance.ring  = this;
		
		// The field in which coefficients are contained
		polynomInstance.field = this.field;
				
		// Calculating the degree of the polynom
		var _degree = coefficients.length - 1;	
        // Skip all high-order nulls
        while (_degree >= 0 && coefficients[_degree] === this.field.nullElement()) {
            --_degree;
        }
		// The degree of the null polynom is minus infinity
        if (_degree === -1) {
            _degree = -Infinity;
        }
		
		// Copying indexes to the private array
		var _coefficients = coefficients.slice(0, (_degree === -Infinity) ? 1 : (_degree + 1));
		
			// This function returns the degree of the polynom
		polynomInstance.degree = function() {
			return _degree;
		};
		
		// This function returns the array of the coefficients
		polynomInstance.coefficients = polynomInstance.coefs = function() {
			// Returning the copy of the original array
			return _coefficients.slice();
		};
		
		// This function returns the value of specified coefficient
		polynomInstance.coefficient = polynomInstance.coef = function(index) {
			// The null polynom has null coefficients
			if(_degree === -Infinity) {
				return this.field.nullElement();
			}	
			
			// We shouldn't throw error in case of bad index, because other 
			// coefficients in fact are null.
			if (index >= 0 && index <= _degree) {
				return _coefficients[index];
			} else {
				return this.field.nullElement();
			}
		};
		
		// This function applicates given value to the polynom, i.e. it returns 
		// a value of the polynom in the specified point
		polynomInstance.application = polynomInstance.app = function(value) {
			// The value of the null polynom is null
			if(_degree === -Infinity) {
				return this.field.nullElement();
			}
			// This will hold result
			var result = this.field.nullElement();
			
			// The current power of x
			var valuePower = this.field.oneElement();

			// Calculating the sum of monomials applicated with this value
			var currentPower = 0;
			for (currentPower = 0; currentPower <= _degree; ++currentPower) {
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
	// 							Factor set function 
	// Mnemonics: (f) -> { [g(x) mod f(x)] }
	// This function returns factor set of the ring by module of given
	// element.
	// --------------------------------------------------------------------
	this.factorSet = function(element) {
		// We cannot divide by the null polynom
		if(element.degree() === -Infinity) {
			throw 'Factorization by null element';
		}
		
		// Calculating the degree of the factor set
		var order = Math.pow(this.field.order, element.degree());
		// Allocating the array for set
		var set = new Array(order);
		
		var i=0;
		for(i=0; i<order; ++i) {
			// Filling the set
			set[i] = this.polynom( baseExpand(i, this.field.order) );
		}
		return set;
	};
	
	// --------------------------------------------------------------------
	// 							Equality function 
	// Mnemonics: (f,g) -> (f(x) == g(x))
	// This function checks if two polynoms are equal
	// --------------------------------------------------------------------
	this.equal = function(f, g) {
		// Checking that polynoms have the same field
		if(f.field.order !== g.field.order) {
			return false;
		}
		
		// Checking polynoms degrees
		if(f.degree() !== g.degree()) {
			return false;
		}
		
		// Checking the null polynom
		var i = f.degree();
		if(i === -Infinity) {
			return true;
		}
		
		// Checking coefficients equality
		for(; i >= 0; --i) {
			if( f.coef(i) !== g.coef(i) ) {
				return false;
			}	
		}
		return true;
	};
	
	// --------------------------------------------------------------------
	// 						Euclidean norm function
	// Mnemonics: f(x) -> deg(f(x))
	// This function returns euclidean norm of the given element. For 
	// polynoms it's just a degree of a polynom.
	// --------------------------------------------------------------------
	this.norm = function(f) {
		return f.degree();
	};

  	// --------------------------------------------------------------------
	// 							Addition function
	// Mnemonics: (f(x), g(x)) -> (f(x) + g(x))
    // This funcion adds two polynoms. Note that f and g are instances of
    // internal class polynom, but not indexes, cause ring is an infinite 
	// structure 
	// --------------------------------------------------------------------
    this.addition = this.add = function(f, g) {
        // The degree is maximum degree of two polynoms
        var degree = Math.max(f.degree(), g.degree());
		
		// The case when both polynoms are null
		if (degree === -Infinity) {
			return this.polynom();
		}
		
        // Allocating an array for coefficients
        var sumCoefs = new Array(degree + 1);

        var i;
        for (i = 0; i <= degree; ++i) {
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
        // Calculate the degree of product polynom (sum of degrees)
        var degree = f.degree() + g.degree();
		
		// The case when at least one of polynoms is null
		if (degree === -Infinity) {
			return this.polynom();
		}
		
        // Allocate memory for product coefficients        
        var productCoefs = new Array(degree + 1);

        var i, j;
        for (i = 0; i <= degree; ++i) {
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
		return this.divmod(f,g) [1];
    };
	
	// --------------------------------------------------------------------
    // 						Integer division function
	// Mnemonics: (f(x), g(x)) -> (f(x) div g(x))
    // This function calculates the integer division one polynom to another
	// --------------------------------------------------------------------
    this.division = this.div = function(f, g) {
		return this.divmod(f,g) [0];
    };
	
	// --------------------------------------------------------------------
    // 						Full division function
	// Mnemonics: (f(x), g(x)) -> [f(x) div g(x), f(x) mod g(x))]
    // This function calculates the full division
	// --------------------------------------------------------------------
	this.divmod = function(f, g, div) {
        // Calculating a degree of each polynom
        var degreeF = f.degree();
        var degreeG = g.degree();

		// Integer division part
		if(div === undefined) {
			div = [];
		}
		
        // When degree of f (divident) is less than degree of g (divisor) than
        // modulo is simply f
        if (degreeF < degreeG) {
            return [this.polynom(div), f];
        }
		
		// We can't divide by the null polynom
		if( degreeG === -Infinity) {
			throw 'Division by zero element of the ring!';
		}

        // Constructs an array for divisor polynom
        var divisor = Array(degreeF + 1);

        // Now we are trying to build polynom which will decrease the divident
        // degree by one. To do that we shift divisor and multiply all its 
        // coefficient by special element(to fill highest coefficient of the
        // divident(f) with null.
		div.unshift(field.mul(f.coef(degreeF), 
						field.inv(g.coef(degreeG))));
						
		var i;
        for (i = 0; i <= degreeF; ++i) {
            if (i >= degreeF - degreeG) {
                var j = (i - degreeF + degreeG);
                // Doing all transformation with coefficients(in field 
                // arithmetics of course)
                var coef = field.mul(g.coef(j), div[0]);

                divisor[i] = field.opp(coef);
            }
            // This will make shift
            else {
                divisor[i] = 0;
            }
        }
        
        // Now adding this stuff to f and repeat this algorithm with a new,
        // 'less-degreeful' divident
        return this.divmod(this.add(f, this.polynom(divisor)), g, div);
    };
	
	// --------------------------------------------------------------------
	// 						Latex string function
	// This function returns latex representation of the given polynom
	// Options: 
	//  level  - sets render depth
	//  modulo - include modulo or not 
	// --------------------------------------------------------------------
	this.toLatex = function(f, options) {
		// Parsing options
		options = options || {};
		options.level  = (options.level  === undefined) ? 1 : options.level;
		options.modulo = (options.modulo === undefined) ? false : options.modulo;  
		
		// Options for the next level of rendering
		var nextOptions = {
			level 	: options.level-1,
			modulo 	: options.modulo
		};
		
		// This will hold result
		var latexStr = '';
		
		if(f.degree() === -Infinity) {
			// If polynom is null, just draw null element
			return this.field.toLatex(this.field.nullElement(), nextOptions);
		}
		
		var monoms = [];
		var i = 0;
		for(i = 0; i <= f.degree(); ++i) {
			// Will not render monoms with null coefficient
			if(f.coef(i) !== this.field.nullElement() ) {
				var currentPower = '';
				
				if(i === 0) {
					// Not render x at 0 degree
					currentPower = '';
				}
				else if(i === 1) {
					// Render only x at 1 degree
					currentPower = 'x';
				} else {
					// Render powers of x at other degrees
					currentPower = 'x^{'+i + '}';
				}	
				
				var currentCoef = '';
				if(options.level > 0) {
					// If level is not null render cofficient completely
					currentCoef = this.field.toLatex(f.coef(i), nextOptions);
				} else {
					if(f.coef(i) !== 1 || i == 0) {
						// If level is null just render index
						currentCoef = f.coef(i).toString();
					}
				}
					
				// Constructing monom result
				var currentMonom = currentCoef + currentPower;
				monoms.unshift(currentMonom);
			}
		}
		
		// The monoms are separated with plus
		latexStr = monoms.join('+');
		
		return latexStr;
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
	
	// Obtaining elements of the factor ring and it's order
	var elementsTable 	= self.ring.factorSet(self.generator);
	self.order 			= elementsTable.length;
	
	// Allocating private data
	var nullIndex 	= NaN; 	// The index of the null element
	var oneIndex 	= NaN;	// The index of the one element
	
	// Allocating private tables. It will speed up some operations like
	// finding an inverse element or opposite element
	var additionTable 		= new Array(this.order);
	var multiplicationTable = new Array(this.order);
	var inverseTable  		= new Array(this.order);
	var oppositeTable 		= new Array(this.order);
	
	// --------------------------------------------------------------------
	// 						Element-by-index function
	// Mnemonics: i -> R(i)
	// This function returns element of the ring by its index
	// --------------------------------------------------------------------
	self.element = function(i) {
		return elementsTable[i];
	};
	
	// --------------------------------------------------------------------
	// 						Index-by-element function
	// Mnemonics: e -> I(e)
	// This function returns the index of the given element
	// --------------------------------------------------------------------
	self.index = function(e) {
		var i = 0;
		for(i=0; i < this.order; ++i) {
			if(self.ring.equal(e, self.element(i))) {
				return i;
			}
		}
		
		// Cannot find element!
		return NaN;
	};
	
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
				var sumIndex = self.index(
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
				var multIndex = self.index(
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
	
	// --------------------------------------------------------------------
	// 						Latex string function
	// This function returns latex representation of element of the ring.
	// Options: 
	//  level  - sets render depth
	//  modulo - include modulo or not 
	// --------------------------------------------------------------------
	this.toLatex = function(i, options) {
		// Parsing options
		options = options || {};
		options.level  = (options.level  === undefined) ? 1 : options.level;
		options.modulo = (options.modulo === undefined) ? false : options.modulo;  
		
		// Defining options for the next level of render
		var nextOptions = {
			level 	: options.level-1,	
			modulo 	: options.modulo
		};
		
		// If index is not a number just draw dash
		if(isNaN(i)) {
			return '-';
		}
		
		// If level is 0 than just draw index
		if(options.level <= 0) {
			return i.toString();
		}
		
		var latexStr = '';
		// Rendering element of the ring
		var elementStr = this.ring.toLatex(this.element(i), nextOptions);
		
		// If module option is set draw modulo
		if(options.modulo) {
			// Rendering generator of the ideal
			var generatorStr = this.ring.toLatex(this.generator, nextOptions);
			// Appending to output
			latexStr = '[' + elementStr + ']' + '_{' + generatorStr + '}';
		} else {
			latexStr = elementStr;
		}
		
		// Returning result
		return latexStr;
	};
}

// --------------------------------------------------------------------
// 							PrimeField class
// This class represents a prime field structure. It is actually a
// factorization of the ring of integers by given irreducible element.
// The irreducible element of this ring is just a prime number.
// So, in common case, this structure is not actually a field, but a 
// factor ring.
// --------------------------------------------------------------------
function PrimeField(num) {
	// Bulding the ring of integers
	var ring = new IntegerRing();
	
	// Factorizing it by given number
	FactorRing.call(this, ring, num);
}




