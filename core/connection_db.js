/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2011 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Components for managing connections between blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.ConnectionDB');
goog.provide('Blockly.ConnectionDB.errorReason');

goog.require('Blockly.Connection');
goog.require('Blockly.Connection.typeCheckContext');
goog.require('Blockly.DiagnosisCollector');

/**
 * Database of connections.
 * Connections are stored in order of their vertical component.  This way
 * connections in an area may be looked up quickly using a binary search.
 * @constructor
 */
Blockly.ConnectionDB = function() {
};

Blockly.ConnectionDB.prototype = new Array();
/**
 * Don't inherit the constructor from Array.
 * @type {!Function}
 */
Blockly.ConnectionDB.constructor = Blockly.ConnectionDB;

/**
 * Add a connection to the database.  Must not already exist in DB.
 * @param {!Blockly.Connection} connection The connection to be added.
 */
Blockly.ConnectionDB.prototype.addConnection = function(connection) {
  if (connection.inDB_) {
    throw 'Connection already in database.';
  }
  if (connection.getSourceBlock().isInFlyout) {
    // Don't bother maintaining a database of connections in a flyout.
    return;
  }
  var position = this.findPositionForConnection_(connection);
  this.splice(position, 0, connection);
  connection.inDB_ = true;
};

/**
 * Find the given connection.
 * Starts by doing a binary search to find the approximate location, then
 *     linearly searches nearby for the exact connection.
 * @param {!Blockly.Connection} conn The connection to find.
 * @return {number} The index of the connection, or -1 if the connection was
 *     not found.
 */
Blockly.ConnectionDB.prototype.findConnection = function(conn) {
  if (!this.length) {
    return -1;
  }

  var bestGuess = this.findPositionForConnection_(conn);
  if (bestGuess >= this.length) {
    // Not in list
    return -1;
  }

  var yPos = conn.y_;
  // Walk forward and back on the y axis looking for the connection.
  var pointerMin = bestGuess;
  var pointerMax = bestGuess;
  while (pointerMin >= 0 && this[pointerMin].y_ == yPos) {
    if (this[pointerMin] == conn) {
      return pointerMin;
    }
    pointerMin--;
  }

  while (pointerMax < this.length && this[pointerMax].y_ == yPos) {
    if (this[pointerMax] == conn) {
      return pointerMax;
    }
    pointerMax++;
  }
  return -1;
};

/**
 * Finds a candidate position for inserting this connection into the list.
 * This will be in the correct y order but makes no guarantees about ordering in
 *     the x axis.
 * @param {!Blockly.Connection} connection The connection to insert.
 * @return {number} The candidate index.
 * @private
 */
Blockly.ConnectionDB.prototype.findPositionForConnection_ = function(
    connection) {
  if (!this.length) {
    return 0;
  }
  var pointerMin = 0;
  var pointerMax = this.length;
  while (pointerMin < pointerMax) {
    var pointerMid = Math.floor((pointerMin + pointerMax) / 2);
    if (this[pointerMid].y_ < connection.y_) {
      pointerMin = pointerMid + 1;
    } else if (this[pointerMid].y_ > connection.y_) {
      pointerMax = pointerMid;
    } else {
      pointerMin = pointerMid;
      break;
    }
  }
  return pointerMin;
};

/**
 * Remove a connection from the database.  Must already exist in DB.
 * @param {!Blockly.Connection} connection The connection to be removed.
 * @private
 */
Blockly.ConnectionDB.prototype.removeConnection_ = function(connection) {
  if (!connection.inDB_) {
    throw 'Connection not in database.';
  }
  var removalIndex = this.findConnection(connection);
  if (removalIndex == -1) {
    throw 'Unable to find connection in connectionDB.';
  }
  connection.inDB_ = false;
  this.splice(removalIndex, 1);
};

/**
 * Find all nearby connections to the given connection.
 * Type checking does not apply, since this function is used for bumping.
 * @param {!Blockly.Connection} connection The connection whose neighbours
 *     should be returned.
 * @param {number} maxRadius The maximum radius to another connection.
 * @return {!Array.<Blockly.Connection>} List of connections.
 */
Blockly.ConnectionDB.prototype.getNeighbours = function(connection, maxRadius) {
  var db = this;
  var currentX = connection.x_;
  var currentY = connection.y_;

  // Binary search to find the closest y location.
  var pointerMin = 0;
  var pointerMax = db.length - 2;
  var pointerMid = pointerMax;
  while (pointerMin < pointerMid) {
    if (db[pointerMid].y_ < currentY) {
      pointerMin = pointerMid;
    } else {
      pointerMax = pointerMid;
    }
    pointerMid = Math.floor((pointerMin + pointerMax) / 2);
  }

  var neighbours = [];
  /**
   * Computes if the current connection is within the allowed radius of another
   * connection.
   * This function is a closure and has access to outside variables.
   * @param {number} yIndex The other connection's index in the database.
   * @return {boolean} True if the current connection's vertical distance from
   *     the other connection is less than the allowed radius.
   */
  function checkConnection_(yIndex) {
    var dx = currentX - db[yIndex].x_;
    var dy = currentY - db[yIndex].y_;
    var r = Math.sqrt(dx * dx + dy * dy);
    if (r <= maxRadius) {
      neighbours.push(db[yIndex]);
    }
    return dy < maxRadius;
  }

  // Walk forward and back on the y axis looking for the closest x,y point.
  pointerMin = pointerMid;
  pointerMax = pointerMid;
  if (db.length) {
    while (pointerMin >= 0 && checkConnection_(pointerMin)) {
      pointerMin--;
    }
    do {
      pointerMax++;
    } while (pointerMax < db.length && checkConnection_(pointerMax));
  }

  return neighbours;
};


/**
 * Is the candidate connection close to the reference connection.
 * Extremely fast; only looks at Y distance.
 * @param {number} index Index in database of candidate connection.
 * @param {number} baseY Reference connection's Y value.
 * @param {number} maxRadius The maximum radius to another connection.
 * @return {boolean} True if connection is in range.
 * @private
 */
Blockly.ConnectionDB.prototype.isInYRange_ = function(index, baseY, maxRadius) {
  return (Math.abs(this[index].y_ - baseY) <= maxRadius);
};

/**
 * Check if the given two connections are compatible. Returns true if they are
 * compatible. Otherwise as follows.
 * - If the incompatibility reason is not found, just return false.
 * - If found and the two connections are enough close, return the reason.
 * @param {!Blockly.Connection} conn The connection searching for a compatible
 *     mate.
 * @param {!Blockly.Connection} target The connection to check compatibility
 *     with.
 * @param {number} maxRadius The maximum radius allowed for connections.
 * @param {number} maxErrorRadius The maximum radius for incompatibility reason.
 * @return {boolean|Object} True if connections are compatible. Otherwise false
 *     or incompatibility reason.
 */
Blockly.ConnectionDB.prototype.canConnectWithError_ = function(conn, target,
    maxRadius, maxErrorRadius) {
  // TODO(harukam): Implement to collect reason.
  var context = new Blockly.Connection.typeCheckContext(false);
  return conn.isConnectionAllowed(target, maxRadius, context);
};

/**
 * @constructor
 */
Blockly.ConnectionDB.errorReason = function(conn, radius, error) {
  this.connection = conn;
  this.radius = radius;
  this.error = error;
};

/**
 * Find the closest compatible connection to this connection.
 * @param {!Blockly.Connection} conn The connection searching for a compatible
 *     mate.
 * @param {number} maxRadius The maximum radius to another connection.
 * @param {!goog.math.Coordinate} dxy Offset between this connection's location
 *     in the database and the current location (as a result of dragging).
 * @param {number=} opt_maxErrorRadius The maximum radius to incompatible
 *     connection. If not provided, use the same radius with maxRadius.
 * @return {!{connection: ?Blockly.Connection, radius: number,
 *       reason: ?Blockly.ConnectionDB.errorReason}} Contains three properties:
 *    'connection' which is either another connection or null, 'radius' which
 *    is the distance, 'reason' which is incompatibility reason if connection
 *    is not found.
 */
Blockly.ConnectionDB.prototype.searchForClosest = function(conn, maxRadius,
    dxy, opt_maxErrorRadius) {
  // Don't bother.
  if (!this.length) {
    return {connection: null, radius: maxRadius, reason: null};
  }

  // Stash the values of x and y from before the drag.
  var baseY = conn.y_;
  var baseX = conn.x_;

  conn.x_ = baseX + dxy.x;
  conn.y_ = baseY + dxy.y;

  // findPositionForConnection finds an index for insertion, which is always
  // after any block with the same y index.  We want to search both forward
  // and back, so search on both sides of the index.
  var closestIndex = this.findPositionForConnection_(conn);

  var bestError = null;
  var bestErrorRadius =
      isNaN(opt_maxErrorRadius) ? maxRadius : opt_maxErrorRadius;

  var bestConnection = null;
  var bestRadius = maxRadius;

  // TODO(harukam): Fix it. The height of connection is not constant.

  function update(index) {
    var target = this[index];
    var err = this.canConnectWithError_(conn, target, bestRadius, bestErrorRadius);
    if (err === true) {
      bestConnection = target;
      bestRadius = target.distanceFrom(conn);
    } else if (err !== false) {
      bestError = err;
      bestErrorRadius = target.distanceFrom(conn);
    }
  }

  // Walk forward and back on the y axis looking for the closest x,y point.
  var pointerMin = closestIndex - 1;
  while (pointerMin >= 0 && this.isInYRange_(pointerMin, conn.y_, maxRadius)) {
    update.call(this, pointerMin);
    pointerMin--;
  }

  var pointerMax = closestIndex;
  while (pointerMax < this.length && this.isInYRange_(pointerMax, conn.y_,
      maxRadius)) {
    update.call(this, pointerMax);
    pointerMax++;
  }

  // Reset the values of x and y.
  conn.x_ = baseX;
  conn.y_ = baseY;

  var error = null;
  if (!bestConnection && bestError) {
    error = new Blockly.ConnectionDB.errorReason(conn, bestErrorRadius,
        bestError);
  }
  // If there were no valid connections, bestConnection will be null.
  return {connection: bestConnection, radius: bestRadius, reason: error};
};

/**
 * Initialize a set of connection DBs for a specified workspace.
 * @param {!Blockly.Workspace} workspace The workspace this DB is for.
 */
Blockly.ConnectionDB.init = function(workspace) {
  // Create four databases, one for each connection type.
  var dbList = [];
  dbList[Blockly.INPUT_VALUE] = new Blockly.ConnectionDB();
  dbList[Blockly.OUTPUT_VALUE] = new Blockly.ConnectionDB();
  dbList[Blockly.NEXT_STATEMENT] = new Blockly.ConnectionDB();
  dbList[Blockly.PREVIOUS_STATEMENT] = new Blockly.ConnectionDB();
  workspace.connectionDBList = dbList;
};
