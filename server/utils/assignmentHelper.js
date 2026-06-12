import deliverymanModel from "../models/deliverymanModel.js";
import deliveryAssignmentModel from "../models/deliveryAssignmentModel.js";
import orderModel from "../models/orderModel.js";
import { createNotification } from "./notificationHelper.js";

const CITY_COORDINATES = {
  mumbai: { lat: 19.0760, lng: 72.8777 },
  delhi: { lat: 28.6139, lng: 77.2090 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  bengaluru: { lat: 12.9716, lng: 77.5946 },
  chennai: { lat: 13.0827, lng: 80.2707 },
  kolkata: { lat: 22.5726, lng: 88.3639 },
  hyderabad: { lat: 17.3850, lng: 78.4867 },
  ahmedabad: { lat: 23.0225, lng: 72.5714 },
  pune: { lat: 18.5204, lng: 73.8567 },
  jaipur: { lat: 26.9124, lng: 75.7873 },
  lucknow: { lat: 26.8467, lng: 80.9462 },
  vadodara: { lat: 22.3072, lng: 73.1812 },
  baroda: { lat: 22.3072, lng: 73.1812 },
  surat: { lat: 21.1702, lng: 72.8311 },
  patna: { lat: 25.5941, lng: 85.1376 },
  bhopal: { lat: 23.2599, lng: 77.4126 },
  chandigarh: { lat: 30.7333, lng: 76.7794 },
  gurgaon: { lat: 28.4595, lng: 77.0266 },
  gurugram: { lat: 28.4595, lng: 77.0266 },
  noida: { lat: 28.5355, lng: 77.3910 }
};

const STATE_COORDINATES = {
  maharashtra: { lat: 19.7515, lng: 75.7139 },
  delhi: { lat: 28.6139, lng: 77.2090 },
  karnataka: { lat: 15.3173, lng: 75.7139 },
  tamilnadu: { lat: 11.1271, lng: 78.6569 },
  "tamil nadu": { lat: 11.1271, lng: 78.6569 },
  "west bengal": { lat: 22.9868, lng: 87.8550 },
  telangana: { lat: 18.1124, lng: 79.0193 },
  gujarat: { lat: 22.2587, lng: 71.1924 },
  rajasthan: { lat: 27.0238, lng: 74.2179 },
  "uttar pradesh": { lat: 26.8467, lng: 80.9462 },
  bihar: { lat: 25.0961, lng: 85.3131 },
  "madhya pradesh": { lat: 22.9734, lng: 78.6569 },
  haryana: { lat: 29.0588, lng: 76.0856 },
  punjab: { lat: 31.1471, lng: 75.3412 }
};

const getAddressCoords = (address) => {
  if (!address) return { lat: 0, lng: 0 };
  let lat = Number(address.lat) || 0;
  let lng = Number(address.lng) || 0;
  const isDefaultCoords = Math.abs(lat - 22.3072) < 0.001 && Math.abs(lng - 73.1812) < 0.001;
  const isZeroCoords = lat === 0 || lng === 0;
  if (isZeroCoords || isDefaultCoords) {
    const city = (address.city || "").toLowerCase().trim();
    const state = (address.state || "").toLowerCase().trim();
    if (CITY_COORDINATES[city]) return CITY_COORDINATES[city];
    if (STATE_COORDINATES[state]) return STATE_COORDINATES[state];
  }
  return { lat, lng };
};

const getAgentCoords = (agent) => {
  if (!agent) return { lat: 0, lng: 0 };
  let lat = Number(agent.deliveryLat) || 0;
  let lng = Number(agent.deliveryLng) || 0;
  const isDefaultCoords = Math.abs(lat - 22.3072) < 0.001 && Math.abs(lng - 73.1812) < 0.001;
  const isZeroCoords = lat === 0 || lng === 0;
  if (isZeroCoords || isDefaultCoords) {
    if (agent.assignedAreas && agent.assignedAreas.length > 0) {
      for (const area of agent.assignedAreas) {
        const areaLower = area.toLowerCase().trim();
        if (CITY_COORDINATES[areaLower]) return CITY_COORDINATES[areaLower];
        if (STATE_COORDINATES[areaLower]) return STATE_COORDINATES[areaLower];
      }
    }
  }
  return { lat, lng };
};

// Calculate geodesic distance between two points in km using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) return Infinity;
  if (lat1 === 0 || lon1 === 0 || lat2 === 0 || lon2 === 0) return Infinity;
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

export const autoAssignDeliveryAgent = async (orderId) => {
  try {
    const order = await orderModel.findById(orderId);
    if (!order) {
      console.log(`[AutoAssign] Order ${orderId} not found`);
      return;
    }
    const activeAssignment = await deliveryAssignmentModel.findOne({
      orderId,
      status: { $in: ["Assigned", "Accepted", "Picked Up", "Out for Delivery"] }
    });
    if (activeAssignment) {
      console.log(`[AutoAssign] Order ${orderId} already has active assignment: ${activeAssignment.status}`);
      return;
    }

    const customerAddress = order.address;
    if (!customerAddress) {
      console.log(`[AutoAssign] Order ${orderId} has no address`);
      return;
    }

    const addressText = `${customerAddress.street || ""} ${customerAddress.city || ""} ${customerAddress.state || ""}`.toLowerCase();

    // 1. Find all active, available agents (supporting legacy/undefined fields)
    const agents = await deliverymanModel.find({
      status: "active",
      availabilityStatus: { $nin: ["Offline", "Busy", "Suspended"] },
      isOnline: { $ne: false }
    });

    if (agents.length === 0) {
      console.log(`[AutoAssign] No active available agents found`);
      return;
    }

    // 2. Find agents who have already rejected this order
    const rejections = await deliveryAssignmentModel.find({
      orderId,
      status: "Rejected"
    });
    const rejectedAgentIds = rejections.map(r => r.agentId.toString());

    // 3. Filter agents by distance first, then fallback to text/zone matching
    const orderCoords = getAddressCoords(customerAddress);
    const orderLat = orderCoords.lat;
    const orderLng = orderCoords.lng;
    
    let eligibleAgents = [];

    if (orderLat && orderLng) {
      eligibleAgents = agents.filter(agent => {
        if (rejectedAgentIds.includes(agent._id.toString())) return false;
        
        // Compute actual distance
        const agentCoords = getAgentCoords(agent);
        const distance = calculateDistance(orderLat, orderLng, agentCoords.lat, agentCoords.lng);
        console.log(`[AutoAssign] Agent ${agent.name} distance: ${distance.toFixed(2)} km, Limit: ${agent.deliveryRadius || 10} km`);
        
        // Active if within their selected delivery radius
        return distance <= (agent.deliveryRadius || 10);
      });
    }

    if (eligibleAgents.length === 0) {
      console.log(`[AutoAssign] No agents found in coordinate radius. Falling back to text/zone matching.`);
      
      eligibleAgents = agents.filter(agent => {
        if (rejectedAgentIds.includes(agent._id.toString())) {
          return false;
        }

        // Check zone matching (assignedAreas)
        if (!agent.assignedAreas || agent.assignedAreas.length === 0) {
          return false;
        }

        return agent.assignedAreas.some(area => addressText.includes(area.toLowerCase()));
      });
    }

    if (eligibleAgents.length === 0) {
      console.log(`[AutoAssign] No zone matches. Checking same city fallback match.`);
      const fallbackAgents = agents.filter(agent => {
        if (rejectedAgentIds.includes(agent._id.toString())) return false;
        if (!customerAddress.city) return false;
        if (!agent.assignedAreas || agent.assignedAreas.length === 0) return false;
        return agent.assignedAreas.some(area => 
          area.toLowerCase().includes(customerAddress.city.toLowerCase()) || 
          customerAddress.city.toLowerCase().includes(area.toLowerCase())
        );
      });

      if (fallbackAgents.length > 0) {
        eligibleAgents = fallbackAgents;
      } else {
        console.log(`[AutoAssign] No fallback agents in city ${customerAddress.city || "unknown"}. Fallback to any active available agent.`);
        eligibleAgents = agents.filter(agent => !rejectedAgentIds.includes(agent._id.toString()));
        if (eligibleAgents.length === 0) {
          console.log(`[AutoAssign] No available agents left who haven't rejected this order.`);
          return;
        }
      }
    }

    // 4. Score and sort eligible agents
    const scoredAgents = eligibleAgents.map(agent => {
      const agentCoords = getAgentCoords(agent);
      let distance = 10;
      if (orderLat && orderLng && agentCoords.lat && agentCoords.lng) {
        distance = calculateDistance(orderLat, orderLng, agentCoords.lat, agentCoords.lng);
      } else {
        let matchDegree = 0;
        if (agent.assignedAreas && agent.assignedAreas.length > 0) {
          agent.assignedAreas.forEach(area => {
            if (addressText.includes(area.toLowerCase())) {
              matchDegree = Math.max(matchDegree, area.length);
            }
          });
        }
        distance = matchDegree > 10 ? 2 : matchDegree > 5 ? 4 : 6;
      }

      return {
        agent,
        distance,
        activeCount: agent.activeDeliveries || 0,
        rating: agent.rating || 5
      };
    });

    scoredAgents.sort((a, b) => {
      // 1. Distance (lower first)
      if (a.distance !== b.distance) return a.distance - b.distance;
      // 2. Active Deliveries (lower first)
      if (a.activeCount !== b.activeCount) return a.activeCount - b.activeCount;
      // 3. Rating (higher first)
      return b.rating - a.rating;
    });

    const bestAgent = scoredAgents[0].agent;

    // 5. Assign the agent
    order.deliverymanId = bestAgent._id;
    await order.save();

    // Create delivery assignment document
    await deliveryAssignmentModel.create({
      orderId: order._id,
      agentId: bestAgent._id,
      status: "Assigned"
    });

    // Notify customer
    await createNotification(
      order.userId,
      order._id,
      "Delivery Agent Assigned",
      `Delivery agent ${bestAgent.name} has been assigned to your order.`,
      "user"
    );

    // Notify agent
    await createNotification(
      bestAgent._id,
      order._id,
      "New Delivery Assignment",
      `You have a new delivery assignment for order #${order._id.toString().slice(-6).toUpperCase()}. Please review and accept.`,
      "deliveryman"
    );

    console.log(`[AutoAssign] Assigned Order ${order._id} to Agent ${bestAgent.name} (Distance: ${scoredAgents[0].distance.toFixed(2)} km)`);
  } catch (error) {
    console.error("[AutoAssign] Error:", error.message);
  }
};
